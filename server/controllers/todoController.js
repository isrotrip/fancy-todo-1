const Todo = require('../models/todo.js');
const Project = require('../models/project.js');
const getJWT = require('../helpers/getJWT.js');

class TodoController {

  static read(req, res){
    const {data} = getJWT(req.headers.token, 'verify');
    Todo
      .find({
        userId: data._id,
        type: 'personal'
      })
      .then(allTodo => {
        res.status(200).json(allTodo);
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static create(req, res){
    const {data} = getJWT(req.headers.token, 'verify');
    Todo
      .create({
        name: req.body.name,
        description: req.body.description,
        status: 'uncomplete',
        updatedDate: new Date,
        dueDate: req.body.dueDate,
        userId: data._id,
        type: 'personal'
      })
      .then(todo => {
        res.status(201).json(todo);
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static update(req, res){
    Todo
      .findOne({
        _id: req.params.id
      })
      .then(todo => {
        if(todo) {
          todo.name = req.body.name;
          todo.description = req.body.description;
          todo.status = req.body.status;
          todo.dueDate = req.body.dueDate;
          todo.updatedDate = new Date;
          todo.save();
          res.status(200).json(todo);
        }
        else {
          res.status(404).json({err: `This Todo isn't available anymore`});
        }
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static delete(req, res){
    Todo
      .findOne({
        _id: req.params.id
      })
      .then(todo => {
        if(todo) {
          const successDeleteName = `Your To Do ${todo.name} Have Been Sucessfully Deleted`;
          todo.remove();
          res.status(200).json(successDeleteName);
        }
        else {
          res.status(404).json({err: `This Todo isn't available anymore`});
        }
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static readTodoProject(req, res){
    const {data} = getJWT(req.headers.token, 'verify');
    Todo
      .find({
        projectId: req.params.projectId,
        type: 'project'
      })
      .then(allTodo => {
        res.status(200).json(allTodo);
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static createTodoProject(req, res){
    const {data} = getJWT(req.headers.token, 'verify');
    Todo
      .create({
        name: req.body.name,
        description: req.body.description,
        status: 'uncomplete',
        dueDate: req.body.dueDate,
        updatedDate: new Date,
        userId: data._id,
        projectId: req.params.projectId,
        type: 'project'
      })
      .then(todo => {
        return Project
          .findById(req.params.projectId)
          .then(project => {
            project.todos.push(todo._id);
            project.save();
            res.status(201).json(todo);
          })
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static updateTodoProject(req, res){
    Todo
      .findById(req.params.id)
      .then(todo => {
        if(todo) {
          todo.name = req.body.name;
          todo.description = req.body.description;
          todo.status = req.body.status;
          todo.updatedDate = new Date;
          todo.dueDate = req.body.dueDate;
          todo.save();
          return Project
            .findById(req.params.projectId)
            .then(project => {
              project.todos.splice(project.todos.indexOf(todo._id), 1, todo._id);
              project.save();
              res.status(200).json(todo);
            })
        }
        else {
          res.status(404).json({err: `This Todo isn't available anymore`});
        }
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

  static deleteTodoProject(req, res){
    Project
      .findById(req.params.projectId)
      .then(project => {
        project.todos.splice(project.todos.indexOf(req.params.projectId, 1))
        project.save();
        return Todo
          .findById(req.params.id)
          .then(todo => {
            if(todo) {
              const successDeleteName = `Your To Do ${todo.name} Have Been Sucessfully Deleted`;
              todo.remove();
              res.status(200).json(successDeleteName);
            }
            else {
              res.status(404).json({err: `This Todo isn't available anymore`});
            }
          })
      })
      .catch(err => {
        res.status(500).json({err: err.message});
      })
  }

}

module.exports = TodoController;