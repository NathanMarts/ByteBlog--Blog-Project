/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Post from 'App/Models/Post'

Route.get('/', async ({ view }) => {
  const posts = await Post.query()
    .preload('creatorUser')
    .withCount('comments')
    .withCount('usersLike')

  return view.render('welcome', { posts })
})
  .as('welcome')
  .middleware('silentAuth')

Route.group(() => {
  Route.get('/', 'AuthController.show').as('show')
  Route.get('/logout', 'AuthController.logout').as('logout')
  Route.post('/', 'AuthController.login').as('login')
})
  .prefix('login')
  .as('login')

Route.group(() => {
  Route.get('/new', 'UsersController.create').as('create')
  Route.get('/edit/:id', 'UsersController.edit').as('edit').middleware('auth')
  Route.get('/:id', 'UsersController.index').as('index').middleware('auth')
  Route.put('/password/:id', 'UsersController.updatePassword')
    .as('updatePassword')
    .middleware('auth')
  Route.put('/:id', 'UsersController.update').as('update').middleware('auth')
  Route.post('/', 'UsersController.store').as('store')
})
  .prefix('/users')
  .as('users')

Route.group(() => {
  Route.get('/', 'PostsController.show').as('show').middleware('auth')
  Route.get('/favorite', 'PostsController.favorite').as('favorite').middleware('auth')
  Route.get('/favorite/:id', 'PostsController.createFavorite')
    .as('favorite.create')
    .middleware('auth')
  Route.get('/like/:id', 'PostsController.like').as('like').middleware('auth')
  Route.get('/:id', 'PostsController.index')
    .as('index')
    .middleware('silentAuth')
    .middleware(({ view }, next) => {
      view.share({
        reply: false,
      })

      return next()
    })
  Route.get('/my_posts/:id', 'PostsController.show').as('myShow').middleware('auth')
  Route.delete('/:id', 'PostsController.destroy').as('destroy').middleware('auth')
  Route.post('/', 'PostsController.store').as('store').middleware('auth')

  Route.group(() => {
    Route.get('/like/:id', 'PostsController.commentLike').as('like')
    Route.get('/:id', 'CommentsController.index').as('index')
    Route.post('/:id', 'PostsController.comment').as('create')

    Route.group(() => {
      Route.get('/like/:id', 'PostsController.replyLike').as('like')
      Route.post('/:id', 'PostsController.reply').as('create')
    })
      .prefix('/replies')
      .as('replies')
      .middleware('auth')
  })
    .prefix('/comments')
    .as('comments')
    .middleware('auth')
})
  .prefix('/posts')
  .as('posts')
