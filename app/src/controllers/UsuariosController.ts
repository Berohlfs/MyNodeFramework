// Libs
import bcrypt from 'bcrypt'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
// Utils
import { responseMessage, server_error_msg } from '../utils/general'
// Prisma
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

class UsuariosController {
    async index(req: Request, res: Response) {
        try {
            const usuarios = await prisma.usuario.findMany({
                include: {
                    posts: true
                }
            })

            usuarios.forEach((usuario) => {
                usuario.senha = ''
            })

            return res.status(200).json(responseMessage('Listagem de usuários.', usuarios))
        } catch (error) {
            console.error(error)
            return res.status(500).json(server_error_msg)
        }
    }

    async create(req: Request, res: Response) {
        try {
            const validation = z
                .object({
                    senha: z.string().min(1),
                    confirmacaoSenha: z.string().min(1),
                    email: z.string().min(1)
                })
                .refine((data) => data.confirmacaoSenha === data.senha)

            if (validation.safeParse(req.body).success === false) {
                return res.status(400).json(responseMessage('Dados inválidos.'))
            }

            const { email, senha } = req.body as z.infer<typeof validation>

            const hash = await bcrypt.hash(senha, 13)

            const usuario = await prisma.usuario.create({
                data: { email, senha: hash }
            })

            usuario.senha = ''
            usuario.id = ''

            return res.status(201).json(responseMessage('Usuário criado.', usuario))
        } catch (error) {
            console.error(error)
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    return res.status(409).json(responseMessage('Este e-mail já é cadastrado.'))
                }
            }
            return res.status(500).json(server_error_msg)
        }
    }

    async login(req: Request, res: Response) {
        try {
            const validation = z.object({
                senha: z.string().min(1),
                email: z.string().min(1)
            })

            if (validation.safeParse(req.body).success === false) {
                return res.status(400).json(responseMessage('Dados inválidos.'))
            }

            const { senha, email } = req.body as z.infer<typeof validation>

            const usuario = await prisma.usuario.findUnique({
                where: {
                    email
                }
            })

            if (!usuario) {
                return res.status(400).json(responseMessage('Credenciais inválidas.'))
            }

            const match = await bcrypt.compare(senha, usuario.senha)

            if (match) {
                const token = jwt.sign({ usuarioId: usuario.id }, process.env.ACCESS_SECRET as string)

                return res.status(201).json(responseMessage('Login realizado com sucesso.', token))
            } else {
                return res.status(400).json(responseMessage('Credenciais inválidas.'))
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json(server_error_msg)
        }
    }
}

export default new UsuariosController()
