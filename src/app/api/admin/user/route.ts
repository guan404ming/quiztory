import { NextResponse, type NextRequest } from "next/server";

import { getAdminServerSession } from "../utils";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { roleChangedRecordTable, userRoleTable, userTable } from "@/db/schema";

const changeUserRoleRequestSchema = z.object({
  changeeId: z.number(),
  role: z.enum(["Admin", "Blocked", "Normal"]),
});

type ChangeUserRoleRequest = z.infer<typeof changeUserRoleRequestSchema>;

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data);

  try {
    changeUserRoleRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { changeeId, role } = data as ChangeUserRoleRequest;

  try {
    await db.transaction(async (tx) => {
      const session = await getAdminServerSession();

      const [changer] = await tx
        .select({
          id: userTable.id,
        })
        .from(userTable)
        .where(eq(userTable.email, session.user.email!));

      const [changee] = await tx
        .select({
          id: userRoleTable.userId,
          role: userRoleTable.role,
        })
        .from(userRoleTable)
        .where(eq(userRoleTable.userId, changeeId));

      await tx
        .insert(userRoleTable)
        .values({ userId: changeeId, role })
        .onConflictDoUpdate({
          target: userRoleTable.userId,
          set: { role },
        });

      await tx
        .insert(roleChangedRecordTable)
        .values({
          from: changee?.role ?? "Normal",
          to: role,
          changeeId: changeeId,
          changerId: changer.id,
        })
        .execute();
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}
