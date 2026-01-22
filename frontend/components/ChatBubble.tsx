import classNames from "classnames";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function ChatBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div className={classNames("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={classNames(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border",
          isUser
            ? "bg-primary text-white border-blue-600"
            : "bg-white text-slate-800 border-slate-100"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}
