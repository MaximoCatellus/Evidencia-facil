/// <reference types="vite/client" />

declare module "next/server" {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): Response;
  }
}
