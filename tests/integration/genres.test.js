const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User}  = require('../../models/user');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {

  beforeEach( async () => {
    server  = require('../../index.js');
    await Genre.collection.insertMany([
      {name: 'genre1'},
      {name: 'genre2'}
    ]);
  });
  afterEach( async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all the genres', async () => {
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  })

  describe('GET / :id', () => {
    let genre;
    let id;

    beforeEach( async () => {
      genre = await Genre.findOne({});
      id = genre._id;
    });

    const exec = async () => {
      return await request(server).get(`/api/genres/${id}`);
    }

    it('should return genre if valid id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = "invlia8383883874";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if id valid but not found', async () => {
      id = mongoose.Types.ObjectId;
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {

    // Define the happy path, and then in each test, we change
    // one parameter that clearly aligns with the name of the
    // test.
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();

      const genre = await Genre.find({ name });

      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('DELETE /', () => {
    let token;
    let genre;
    let id;

    const exec = async() => {
      return await request(server)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach( async () => {
      token = new User({isAdmin:true}).generateAuthToken();
      genre = await Genre.findOne({name: 'genre1'});
      id = genre._id;
    });

    it('should delete the genre from db when logged in with valid id', async () => {
      await exec();
      const genreInDb = await Genre.findOne({_id : id});
      expect(genreInDb).toBeNull();
    });

    it('should return the deleted genre', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 401 when not admin or logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 403 for if user not admin', async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it('should return 404 for invalid id', async () => {
      id = '1234';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 for if no genre with id was found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

  });

  describe('PUT/:id', () => {
    let token;
    let genre;
    let id;
    let newName = 'newName';

    beforeEach( async () => {
      token = new User({isAdmin:true}).generateAuthToken();
      genre = new Genre({name: 'oldName'});
      await genre.save();
      id = genre._id
    });

    const exec= async () => {
      return await request(server)
        .put(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send({ name: newName });
    };

    it('should update the record with changed attributes', async () => {
      const res = await exec();
      const updated = await Genre.findOne({_id : id});
      expect(res.status).toBe(200);
      expect(updated.name).toEqual(newName);
    });

    it('should return the record with changed attributes', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });

    it('should return a 404 for an invalid id', async () => {
      id = 'notanid';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return a 404 for when genre not found', async () => {
      id = new mongoose.Types.ObjectId;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return a 401 if not logged in', async () => {
      token = '';
      id = 'notanid';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return a 403 if not admin', async () => {
      token = new User({isAdmin:false}).generateAuthToken();
      id = 'notanid';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 400 if for invalid input', async () => {
      newName = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});
