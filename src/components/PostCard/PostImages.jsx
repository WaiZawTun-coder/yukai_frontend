import Image from "next/image";

export default function PostImages({ images }) {
  if (!images.length) return null;

  return (
    <div className={`post-images post-images-${Math.min(images.length, 6)}`}>
      {images.map((img, i) => (
        <div key={img.post_attachment_id} className="image-wrapper">
          <Image
            src={`/api/images?url=${img.file_path}`}
            alt={img.post_id}
            fill
            sizes={`(max-width: 768px) 100vw, (max-width: 1024px) 50vw, ${
              100 / 3
            }vw`}
            loading="eager"
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}
