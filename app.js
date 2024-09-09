import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Task from './models/Task.js';
import cors from 'cors';

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to DB'));

const app = express();

const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'https://netlify.com']
};

// middleware 모든 요청에 공통적으로 적용
app.use(express.json());
app.use(cors(corsOptions));

// useAsync hook
function asyncHandler(handler) {
  // 함수를 인수로 받아서 함수를 반환
  const newHandler = async function (req, res) {
    try {
      await handler(req, res);
    } catch (err) {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'Cannot find given id.' });
      } else {
        res.status(500).send({ message: err.message });
      }
    }
  };
  return newHandler;
}

// 생성
app.post(
  '/tasks',
  asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);
    res.status(201).send(newTask);
  })
);

// 목록 가져오기
app.get(
  '/tasks',
  asyncHandler(async (req, res) => {
    const sort = req.query.sort;
    const sortOption = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const count = Number(req.query.count);

    const tasks = await Task.find().sort(sortOption).limit(count); // full scan
    res.send(tasks);
  })
);

// 해당 id 가져오기
app.get(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id); // id string

    if (task) {
      res.send(task);
    } else {
      res.status(404).send({ message: '없습니다' });
    }
  })
);

// 업데이트
app.patch(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id); // DB에서 데이터 얻어옴.
    if (task) {
      Object.keys(req.body).forEach((key) => {
        task[key] = req.body[key]; // 데이터 수정
      });
      await task.save(); // DB와 동기화(변경 전송)
      res.send(task);
    } else {
      res.status(404).send({ message: '없습니다' });
    }
  })
);

// 삭제
app.delete(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    if (task) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: '없습니다' });
    }
  })
);

app.listen(process.env.PORT, () => console.log('sever on'));
console.log('Hi');
