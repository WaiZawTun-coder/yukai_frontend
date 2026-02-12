export default function ImagePreview({ images, onRemove, removable }) {
  return (
    <div className="image-preview-grid">
      {images.map((src, i) => (
        <div key={i} className="preview-item">
          <img src={src} alt="" />
          {removable &&
            <button onClick={() => onRemove(i)}>×</button>
          }
        </div>
      ))}
    </div>
  );
}
