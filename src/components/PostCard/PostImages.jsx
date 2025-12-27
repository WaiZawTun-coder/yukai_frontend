export default function PostImages({ images }) {
  if (!images.length) return null;

  return (
    <div className={`post-images ${images.length === 1 ? "single" : "grid"}`}>
      {images.map((img, i) => (
        <img key={i} src={img.attachment} alt={img.post_id} />
      ))}
    </div>
  );
}
