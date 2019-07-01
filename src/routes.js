import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

import authMiddleware from './app/middlewares/auth';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// As rotas abaixo precisam de autenticação do usuário
routes.use(authMiddleware);

// Users
routes.put('/users', UserController.update);

// Files
routes.post('/files', upload.single('file'), FileController.store);

// Meetups
routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);

export default routes;
