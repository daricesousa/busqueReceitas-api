import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../models/modelUser";
import * as bcrypt from "bcryptjs";
import * as EmailValidator from "email-validator";
import jwt from 'jsonwebtoken';
import { Params } from "../utils/params";

class ControllerUser {
  async listUsers (req: Request, res: Response) {
    try{
      const repository = getRepository(User);
      const users = await repository.find();
      res.json({
        message: 'usuários retornados com sucesso',
        data: {
          users: users.map((user) => {
            return {
              ...user,
              password: undefined,
            }
          }),
        }
      })
    }catch(error) {
      console.log(error);
      return res.status(500).json({message: "Erro no servidor"})
      
    }
  }
  
  // userRepository = getRepository(User);
  // async deleteAllUsers(req: Request, res: Response) {
  //   await this.userRepository.delete({});
  //   res.json({
  //     message: "usuários deletados",
  //   })
  // }
  async create(req: Request, res: Response) {
    try {
      const fields = Params.required(req.body, ['name', 'email', 'password']);
      if (fields) return res.status(433).json({message: "Campos inválidos", campos: fields})
      
      const { name, email, password} = req.body;      
      const userRepository = getRepository(User);

      const userFind = await userRepository.findOne({ email });
      if (userFind) {
        return res.status(403).json({
          message: "Email já cadastrado",
        });
      }
      const hashP = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        name: name,
        email: email,
        password: hashP,
      });
      await userRepository.save(user);
      return res.json({
        message: "usuário criado",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "erro interno",
      });
    }
  }

  async sign(req: Request, res: Response) {
    try {
      const { email, password } = req.body;      
      if (!email || !password) {
        return res.status(433).json({
          message: "email e password são campos obrigatorios",
        });
      } else if (!EmailValidator.validate(email)) {
        return res.status(403).json({
          message: "email invalido",
        });
      } else if (password.length < 8) {
        return res.status(403).json({
          message: "password deve ter no minimo 8 caracteres",
        });
      }

      const userRepository = getRepository(User);
      const userAlreadyExists = await userRepository.findOne({ email });

      if (!userAlreadyExists || "") {
        return res.status(404).json({
          message: "usuario não encontrado",
        });
      }
      const authorization = await bcrypt.compare(
        password,
        userAlreadyExists.password
      );

      if (authorization) {
        const date = Date();

        const token = jwt.sign(
          {
            id: userAlreadyExists.id,
            date: date,
          },
          process.env.SECRET,
        );
        if (!userAlreadyExists.valid_sign) {
          await userRepository.update(userAlreadyExists.id, { valid_sign: date })
        }
        return res.json({
          message: "login efetuado",
          user: userAlreadyExists.name,
          token,
        });
      } else {
        return res.status(403).json({
          message: "senha invalida",
        });
      }

    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "erro interno",
      });
    }
  }
}

export { ControllerUser };
