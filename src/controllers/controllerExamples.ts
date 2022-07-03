import { getRepository } from "typeorm";
import { User } from "../models/modelUser";
import { Request, Response } from "express";
import { Params } from "../utils/params"
import { MyReq } from "../interfaces/myReq";

class Examples {
  async teste(req: Request, res: Response) {
    try{
      const usersRepository = getRepository(User); // retorna um repository da classe que foi passada pra ele
      const users = await usersRepository.find();
      // find retorna a lista salva no banco de dados, nesse caso a lista de usuários
      return res.json({message: 'testado', users: users});
    }catch(error) {
      console.log(error);
      res.status(500).json({message: 'erro na api'})
    }
  }

  async testeWithParams(req: Request, res: Response) {
    const fields = Params.required(req.body, ['email', 'senha']);    
    if (fields) return res.status(403).json({message: 'campos inválidos', campos: fields});   
    return res.json({message: 'sucesso', body: {email: req.body.email}});
  }

  async testeAuth(req: MyReq, res: Response) {
    const usersRepository = getRepository(User);
    // const receitas = await usersRepository.findAndCount({name: "weliton Sousa"});
    const receitas = await usersRepository.find();
    const filter = receitas.filter((receita) => receita.name === "weliton Sousa");
    return res.json({message: 'testado', receitas: filter})
  }
}

export { Examples }