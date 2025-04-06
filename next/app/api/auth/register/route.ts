import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from 'crypto';

const validatePassword = (password: string) => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character (!@#$%^&*)" };
  }
  return { isValid: true };
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validar campos requeridos
    if (!email || !name || !password) {
      return new NextResponse(
        JSON.stringify({ 
          message: "All fields are required",
          code: "MISSING_FIELDS" 
        }), 
        { status: 400 }
      );
    }

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          message: emailValidation.message,
          code: "INVALID_EMAIL" 
        }), 
        { status: 400 }
      );
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          message: passwordValidation.message,
          code: "INVALID_PASSWORD" 
        }), 
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ 
          message: "This email is already registered",
          code: "EMAIL_EXISTS" 
        }), 
        { status: 400 }
      );
    }

    // Generar un ID único para el usuario
    const userId = crypto.randomUUID();

    // Hash password y crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        password: hashedPassword,
        role: 'USER',
        lastLogin: new Date(),
        cart: {
          create: {} // Crear carrito vacío para el usuario
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: "Registration successful",
      user
    });
    
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: "An error occurred during registration",
        code: "INTERNAL_ERROR" 
      }), 
        { status: 500 }
    );
  }
}