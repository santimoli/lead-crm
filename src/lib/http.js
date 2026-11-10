import { NextResponse } from "next/server";
import { z } from "zod";
import { ConflictError, NotFoundError } from "@/lib/errors";

export function errorResponse(error) {
  if (error instanceof z.ZodError) {
    const fields = {};
    for (const issue of error.issues) {
      if (issue.path[0]) fields[issue.path[0]] ??= issue.message;
    }
    return NextResponse.json(
      { error: "Validation failed", fields },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof ConflictError) {
    return NextResponse.json(
      { error: error.message, fields: error.fields },
      { status: 409 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
