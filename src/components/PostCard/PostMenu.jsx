"use client";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import { useEffect, useRef, useState } from "react";
import SavedList from "../SavedList";
import Modal from "../ui/Modal";
import Popup from "../ui/Popup";
import PostComposer from "../postComposer/PostComposer";

export default function PostMenu({ isOwner, postId, handleDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const apiFetch = useApi();

  const { showSnackbar } = useSnackbar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostEditing, setIsPostEditing] = useState(false);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async ({ listId }) => {
    const res = await apiFetch("/api/save-post", {
      method: "POST",
      body: { post_id: postId, saved_list_id: listId },
    });

    showSnackbar({
      title: "Save Post",
      message: res.message || "",
      variant: res.status ? "success" : "error",
    });
  };

  const handleHide = async () => {
    const res = await apiFetch(`/api/hide-post`, {
      method: "POST",
      body: { post_id: postId },
    });

    showSnackbar({
      title: "Hide Post",
      message: res.message || "",
      variant: res.status ? "success" : "error",
    });
  };

  const handleReport = async () => {
    const res = await apiFetch(`/api/report-post`, {
      method: "POST",
      body: { post_id: postId },
    });

    showSnackbar({
      title: "Report Post",
      message: res.message || "",
      variant: res.status ? "success" : "error",
    });
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="post-menu" ref={ref}>
      <button
        className="post-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Post options"
      >
        ⋯
      </button>

      {open && (
        <div className="post-menu-dropdown">
          {isOwner ? (
            <>
              <button onClick={() => { setIsPostEditing(true) }}>Edit post</button>
              <button>Change privacy</button>
              <button className="danger" onClick={handleDelete}>
                Delete post
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsModalOpen(true)}>Save post</button>
              <button onClick={handleHide}>Hide post</button>
              <button onClick={handleReport}>Report post</button>
            </>
          )}
          {/* <button>View edit history</button> */}
        </div>
      )}
      {isModalOpen && <ModalSavePost onClose={onClose} savePost={handleSave} />}
      {isPostEditing && <PostComposer editPostId={postId} isEditing={true} handleCreate={() => {
        setIsPostEditing(false)
      }} onClose={() => { setIsPostEditing(false) }} isOpen={true} />}
    </div>
  );
}

const ModalSavePost = ({ onClose, savePost }) => {
  const { user } = useAuth();
  const apiFetch = useApi();
  const { showSnackbar } = useSnackbar();

  const [savedLists, setSavedLists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [searchListValue, setSearchListValue] = useState("");
  const [selectedList, setSelectedList] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const getSavedLists = async () => {
      const res = await apiFetch(
        `/api/get-saved-lists?username=${user.username}`
      );

      if (!res.status) {
        showSnackbar({
          title: "Failed to get saved lists",
          message: res.message || "",
          variant: "error",
        });
      }

      setSavedLists(res.data || []);
    };

    getSavedLists();
  }, [apiFetch, showSnackbar, user]);

  useEffect(() => {
    const updateSearch = () => {
      if (!savedLists) return;
      setFilteredList(
        savedLists.filter((list) => list.name.includes(searchListValue))
      );
    };

    updateSearch();
  }, [savedLists, searchListValue]);

  const handleCreateSavedList = async ({ listName }) => {
    if (!listName.trim() || creating) return;

    setCreating(true);

    const res = await apiFetch("/api/create-saved-list", {
      method: "POST",
      body: { name: listName },
    });

    setCreating(false);

    if (!res.status) {
      showSnackbar({
        title: "Failed to create new save list",
        message: res.message || "Something went wrong",
        variant: "error",
      });
      return;
    }

    setSavedLists((prev) => [...prev, res.data]);
    showSnackbar({
      title: "New save list created",
      message: `New save list named "${res.data.name}" has been created`,
      variant: "success",
    });
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title="Save post">
        <div className="save-post-action-box">
          <input
            placeholder="Search Saved list"
            value={searchListValue}
            onChange={(e) => setSearchListValue(e.target.value)}
          />
          <button className="action-icon" onClick={() => setIsPopupOpen(true)}>
            <AddCircleOutlinedIcon />
          </button>
        </div>
        <SavedList
          setSelectedSavedList={setSelectedList}
          savedLists={filteredList || []}
        />
        <br />
        <div className="poopup-footer">
          <div className="popup-actions">
            <button className="popup-btn popup-btn-cancel">Cancel</button>
            <button
              className="popup-btn popup-btn-confirm"
              disabled={!selectedList}
              onClick={() => {
                if (selectedList)
                  savePost({ listId: selectedList.saved_list_id });
              }}
            >
              Save
            </button>
          </div>
        </div>
        {isPopupOpen && (
          <CreateSavedListPopup
            onClose={() => setIsPopupOpen(false)}
            createlist={handleCreateSavedList}
          />
        )}
      </Modal>
    </>
  );
};

const CreateSavedListPopup = ({ onClose, createlist }) => {
  const [newSaveListName, setNewListName] = useState("");
  return (
    <Popup
      isOpen={true}
      onClose={onClose}
      title={"Create New Saved List"}
      footer={
        <div className="popup-actions">
          <button
            className="popup-btn popup-btn-cancel"
            onClick={() => {
              onClose();
              setNewListName("");
            }}
          >
            Cancel
          </button>
          <button
            className="popup-btn popup-btn-confirm"
            onClick={async () => {
              await createlist({ listName: newSaveListName });
              onClose();
              setNewListName("");
            }}
          >
            Create
          </button>
        </div>
      }
    >
      <div className="">
        <input
          placeholder="New saved list name"
          value={newSaveListName}
          onChange={(e) => {
            setNewListName(e.target.value);
          }}
        />
      </div>
    </Popup>
  );
};
