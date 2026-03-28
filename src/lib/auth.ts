import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        matKhau: { label: 'Mật khẩu', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.matKhau) {
          return null;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email.toLowerCase(),
              password: credentials.matKhau
            })
          });

          const data = await res.json();

          if (res.ok && data.success && data.data) {
            // data.data chứa { id, name, email, role, token }
            return {
              id: data.data.id.toString(),
              email: data.data.email,
              name: data.data.name,
              role: data.data.role,
              token: data.data.token,
              // API chưa trả phone và avatar, có thể bổ sung sau nếu cần
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        // Gắn token vào session để truyền xuống các API Client
        (session.user as any).token = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/dang-nhap',
    error: '/dang-nhap',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
