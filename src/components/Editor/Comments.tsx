// Inline comments UI for Notion-style editor
import React, { useState } from 'react';

export interface Comment {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
}

interface CommentThreadProps {
  blockId: string;
  comments: Comment[];
  onAddComment?: (text: string) => void;
  onResolve?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentThread({
  blockId,
  comments,
  onAddComment,
  onResolve,
  onDelete,
}: CommentThreadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = () => {
    if (replyText.trim()) {
      onAddComment?.(replyText);
      setReplyText('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
        title="View comments"
      >
        💬 {comments.length}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className={`p-2 rounded ${comment.resolved ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: comment.authorColor }}
                    />
                    <span className="text-xs font-medium text-gray-900">{comment.author}</span>
                  </div>
                  <div className="flex gap-1">
                    {!comment.resolved && (
                      <button
                        onClick={() => onResolve?.(comment.id)}
                        className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(comment.id)}
                      className="text-xs px-1 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-700 mt-1">{comment.text}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {comment.timestamp.toLocaleTimeString()}
                </span>
                {comment.resolved && (
                  <span className="text-xs text-gray-500 font-medium">✓ Resolved</span>
                )}
              </div>
            ))}
          </div>

          {!comments.some((c) => c.resolved) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full text-xs p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
              <button
                onClick={handleSubmit}
                disabled={!replyText.trim()}
                className="mt-1 w-full text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentsBarProps {
  comments: Map<string, Comment[]>;
  onBlockComment?: (blockId: string, text: string) => void;
  onResolveComment?: (blockId: string, commentId: string) => void;
}

export function CommentsSidebar({ comments, onBlockComment, onResolveComment }: CommentsBarProps) {
  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Comments</h3>
      {comments.size === 0 ? (
        <p className="text-xs text-gray-500">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {Array.from(comments.entries()).map(([blockId, blockComments]) => (
            <div key={blockId} className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Block {blockId.slice(0, 6)}</p>
              <div className="space-y-2">
                {blockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`text-xs p-2 rounded ${
                      comment.resolved ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-900'
                    }`}
                  >
                    <div className="font-medium">{comment.author}</div>
                    <p className="line-clamp-2 mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
