import Image from "next/image";

export default function PostImages({ images }) {
  if (!images.length) return null;

  return (
    <div className={`post-images ${images.length === 1 ? "single" : "grid"}`}>
      {images.map((img, i) => (
        <img
          key={i}
          src={`/api/images?url=${img.file_path}`}
          alt={img.post_id}
        />
        // <Image
        //   key={i}
        //   src={`/api/images?url=${img.file_path}`}
        //   alt={img.post_id}
        //   width={100}
        //   height={100}
        // />
      ))}
      {/* <Image
        src={`/api/images?url=http://localhost/yukai_backend/public/uploads/posts-images/img_6957668b56a8b8.16379627.png`}
        alt="Post image"
        width={400}
        height={300}
      /> */}
    </div>
  );
}
