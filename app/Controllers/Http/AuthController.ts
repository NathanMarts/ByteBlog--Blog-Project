import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ToastService from 'App/Services/ToastService'

export default class AuthController {
  constructor(private toastService: ToastService) {
    this.toastService = new ToastService()
  }

  public async show({ view }) {
    return view.render('pages/auth/login')
  }

  public async login({ request, response, session, auth }: HttpContextContract) {
    const authSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string({ trim: true }, [rules.minLength(8)]),
    })

    const payload = await request.validate({
      schema: authSchema,
      messages: {
        required: 'Campo Obrigatório!',
        email: 'Email inválido!',
        minLength: 'A {{ field }} deve conter pelo menos 8 caracteres.',
      },
    })

    try {
      await auth.attempt(payload.email, payload.password)
      this.toastService.success(session, 'Login efetuado!', 4000)
      return response.redirect().toRoute('welcome')
    } catch (error) {
      this.toastService.error(session, 'Email ou senha incorreto!', 4000)
      session.flash(payload)
      return response.redirect().back()
    }
  }

  public async logout({ auth, response, session }: HttpContextContract) {
    auth.logout()

    this.toastService.success(session, 'Logout efetuado!', 4000)
    return response.redirect().toRoute('login.show')
  }
}
