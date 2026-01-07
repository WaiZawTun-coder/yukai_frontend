export default function EmojiPicker({ onSelect }) {
  const emojis = [
    "😀",
    "😂",
    "😍",
    "🥳",
    "🔥",
    "👍",
    "❤️",
    "😎",
    "😭",
    "🤯",
    "🤔",
    "✨",
  ];

  return (
    <div className="emoji-picker">
      {emojis.map((e) => (
        <button key={e} onClick={() => onSelect(e)}>
          {e}
        </button>
      ))}
    </div>
  );
}
