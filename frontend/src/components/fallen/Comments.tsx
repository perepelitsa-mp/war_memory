import { CommentWithAuthor } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Reply } from "lucide-react";

import { cn } from "@/lib/utils";

interface CommentsProps {
  comments: CommentWithAuthor[];
}

interface CommentItemProps {
  comment: CommentWithAuthor;
  depth?: number;
}

function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const maxDepth = 3;
  const isNested = depth > 0;
  const canReply = depth < maxDepth;

  const initials = comment.author.full_name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(isNested && "ml-6 mt-4")}>
      <Card
        className={cn(
          "border border-border/40 bg-background-soft/80 shadow-soft backdrop-blur-sm",
          isNested && "border-l-2 border-l-primary/50",
        )}
      >
        <CardContent className="space-y-4 pt-5">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 shadow-soft">
              <AvatarImage src={comment.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {comment.author.full_name}
                </span>
                <span className="text-xs text-foreground/60">
                  {formatDate(comment.created_at)}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {comment.content}
              </p>

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-max px-2 text-xs text-foreground/60 transition hover:text-foreground"
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Ответить
                </Button>
              )}
            </div>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Comments({ comments }: CommentsProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background-soft/70 px-6 py-10 text-center text-sm text-foreground/70">
        <MessageCircle className="mx-auto h-12 w-12 text-foreground/30" />
        <p className="mt-4 text-base text-foreground/70">
          Пока нет комментариев. Напишите первое тёплое слово о герое.
        </p>
        <Button variant="outline" className="mt-4 gap-2">
          <MessageCircle className="h-4 w-4" />
          Оставить комментарий
        </Button>
      </div>
    );
  }

  const visibleComments = comments.filter(
    (comment) => !comment.is_hidden && !comment.is_deleted && !comment.parent_id,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Оставить комментарий
        </Button>
      </div>

      <div className="space-y-4">
        {visibleComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {visibleComments.length > 0 && (
        <div className="border-t pt-4 text-center text-sm text-foreground/60">
          Всего комментариев: {visibleComments.length}
        </div>
      )}
    </div>
  );
}