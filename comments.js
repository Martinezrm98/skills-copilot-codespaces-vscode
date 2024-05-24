// Create web server
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

app.use(express.json());

app.post('/comments', (req, res) => {
  const { name, comment } = req.body;
  if (!name || !comment) {
    return res.status(400).send('Name and comment are required');
  }
  const comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  comments.push({ name, comment });
  fs.writeFileSync('./comments.json', JSON.stringify(comments));
  res.status(201).send('Comment added');
});

app.get('/comments', (req, res) => {
  const comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  res.send(comments);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Path: comments.test.js
// Test the create comment endpoint
const request = require('supertest');
const fs = require('fs');
const app = require('./comments');

describe('POST /comments', () => {
  it('should return 400 if name is missing', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ comment: 'This is a comment' });
    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if comment is missing', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ name: 'John' });
    expect(response.statusCode).toBe(400);
  });

  it('should return 201 if name and comment are provided', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ name: 'John', comment: 'This is a comment' });
    expect(response.statusCode).toBe(201);
  });

  it('should add the comment to the comments.json file', async () => {
    await request(app)
      .post('/comments')
      .send({ name: 'John', comment: 'This is a comment' });
    const comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
    expect(comments.length).toBe(1);
    expect(comments[0].name).toBe('John');
    expect(comments[0].comment).toBe('This is a comment');
  });
});

// Path