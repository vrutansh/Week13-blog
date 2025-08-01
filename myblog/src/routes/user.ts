import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode, sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@vrutanshpatel/common";


export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
    
  }
}>()

// export const userRouter = new Hono()


userRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const {success} = signupInput.safeParse(body);
  if(!success) {
    c.status(400);

    return c.json({
      message: "Inputs Invalid"
    }) 
  }

  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL, 
  }).$extends(withAccelerate())
  
  
 const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  })
  
  
  const token = await sign({id: user.id}, c.env.JWT_SECRET)
  return c.json({jwt: token})
})

userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json()
  const { success } = signinInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });

  if(!user) {
    c.status(403);
    return c.json({error: "User not Found"})
  }

  const jwt = await sign({id: user.id}, c.env.JWT_SECRET)
  return c.text('Hello Hono!')
})

