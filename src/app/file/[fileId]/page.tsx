import { redirect } from "next/navigation";

import { eq, and, desc } from "drizzle-orm";
import { User } from "lucide-react";

import CommentBlock from "@/components/CommentBlock";
import PageContainer from "@/components/PageContainer";
import TimeText from "@/components/Timetext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import {
  commentTable,
  courseTable,
  fileTable,
  instructorTable,
  userTable,
} from "@/db/schema";

export default async function FilePage({
  params,
}: {
  params: {
    fileId: number;
  };
}) {
  const { fileId } = params;

  const [file] = await db
    .select({
      id: fileTable.id,
      contentType: fileTable.contentType,
      examType: fileTable.examType,
      downloadURL: fileTable.downloadURL,
      courseName: courseTable.name,
      courseNumber: courseTable.number,
      semester: courseTable.semester,
      instructorName: instructorTable.name,
    })
    .from(fileTable)
    .innerJoin(courseTable, eq(fileTable.courseId, courseTable.id))
    .innerJoin(
      instructorTable,
      eq(instructorTable.id, courseTable.instructorId),
    )
    .where(and(eq(fileTable.id, fileId), eq(fileTable.status, "Public")))
    .execute();

  if (!file) {
    redirect(`/`);
  }

  const commentData = await db
    .select({
      id: commentTable.id,
      content: commentTable.content,
      createdAt: commentTable.createdAt,
      username: userTable.name,
    })
    .from(commentTable)
    .innerJoin(userTable, eq(commentTable.userId, userTable.id))
    .where(eq(commentTable.fileId, fileId))
    .orderBy(desc(commentTable.createdAt))
    .limit(100)
    .execute();

  return (
    <PageContainer emoji="📁" title={`${file.courseNumber} ${file.courseName}`}>
      <div className="flex space-x-3 px-5 py-2">
        <div className="flex space-x-2">
          <Badge>{file.semester}</Badge>
          <Badge>{file.instructorName}</Badge>
        </div>
        <CommentBlock></CommentBlock>
      </div>
      <div className="flex flex-col space-y-3 px-5 py-2">
        {commentData.map((comment) => (
          <Alert
            key={comment.id}
            className="min-w-[200px] align-middle drop-shadow-sm"
          >
            <User className="ml-1 h-5 w-5" />
            <AlertTitle className="mb-3 ml-2">{comment.content}</AlertTitle>
            <AlertDescription className="ml-2 text-xs text-gray-500">
              @ {comment.username} &nbsp;
              <TimeText date={comment.createdAt} format="MM/DD h:mm A" />
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </PageContainer>
  );
}
