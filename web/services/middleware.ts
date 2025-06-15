import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest){
  const access_token = req.cookies.get('access_token');

  if(!access_token){
    return NextResponse.redirect(new URL('/auth/login',req.url ));
  }

  return NextResponse.next();
}

export const config= {
  matcher: ['/lessons/add', '/record', '/custom']
}