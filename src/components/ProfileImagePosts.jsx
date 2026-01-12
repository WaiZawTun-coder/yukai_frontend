"use client";

import Image from "next/image";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useState } from "react";
import Modal from "./ui/Modal";
import SocialPost from "@/app/(main)/post/page";

const ProfileImagePost = ({ posts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [comments, setComments] = useState("");
  const [curCommentPage, setCurCommentPage] = useState(1);

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <div key={post.post_id} className="image-wrapper post">
          <Image
            src={`/api/images?url=${post.attachments[0].file_path}`}
            alt={post.post_id}
            fill
            sizes={`(max-width: 768px) 100vw, (max-width: 1024px) 50vw, ${
              100 / 3
            }vw`}
            loading="eager"
            style={{ objectFit: "cover" }}
            onClick={() => {
              setModalPost(post);
              setIsModalOpen(true);
            }}
          />
          {post.attachments.lenght > 1 && (
            <CollectionsIcon className="image-stack-icon" fontSize="large" />
          )}
        </div>
      ))}
      {modalPost && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalPost(null);
            setComments([]);
            setCurCommentPage(1);
          }}
          title={modalPost.creator.display_name + "'s Post"}
        >
          <div className="post-modal-main">
            <SocialPost paramPost={modalPost} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfileImagePost;
