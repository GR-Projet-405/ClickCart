import React, { useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Textarea from "../common/Textarea";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function WriteReviewForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setImageError("");
    setFormMessage("");

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setImageError("You can upload a maximum of 3 photos.");
      event.target.value = "";
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError("Only JPG and PNG images are allowed.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setImageError("Each image must be 5 MB or smaller.");
        continue;
      }

      validFiles.push(file);
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((currentImages) => [...currentImages, ...newImages]);

    if (validFiles.length > remainingSlots) {
      setImageError("Only the first 3 photos can be added.");
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((currentImages) => {
      const imageToRemove = currentImages[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return currentImages.filter((_, imageIndex) => imageIndex !== index);
    });

    setImageError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!rating || !review.trim()) {
      return;
    }

    setFormMessage(
      "Review form validated successfully. Backend submission will be connected next."
    );
  };

  const canSubmit = rating > 0 && review.trim().length > 0;

  return (
    <Card className="write-review-card">
      <div className="write-review-card__header">
        <div>
          <span className="write-review-card__eyebrow">
            Verified booking
          </span>

          <h2>Write a Review</h2>

          <p>
            Tell others about your experience with this service provider.
          </p>
        </div>
      </div>

      <form className="write-review-form" onSubmit={handleSubmit}>
        <fieldset className="review-rating-field">
          <legend>Your rating</legend>

          <div
            className="review-rating-stars"
            role="radiogroup"
            aria-label="Choose a rating from 1 to 5 stars"
          >
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                className={`review-rating-star ${
                  starValue <= rating
                    ? "review-rating-star--selected"
                    : ""
                }`}
                type="button"
                role="radio"
                aria-checked={rating === starValue}
                aria-label={`${starValue} star${
                  starValue > 1 ? "s" : ""
                }`}
                onClick={() => {
                  setRating(starValue);
                  setFormMessage("");
                }}
              >
                <Star
                  size={30}
                  fill={
                    starValue <= rating
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            ))}
          </div>

          <span className="review-rating-label">
            {rating
              ? `${rating} out of 5 stars`
              : "Select your rating"}
          </span>
        </fieldset>

        <div className="review-text-field">
          <Textarea
            id="review-content"
            label="Your review"
            placeholder="Share details about the quality of the service, communication, punctuality, and your overall experience..."
            value={review}
            maxLength={500}
            rows={6}
            required
            onChange={(event) => {
              setReview(event.target.value);
              setFormMessage("");
            }}
          />

          <span className="review-character-count">
            {review.length}/500
          </span>
        </div>

        <div className="review-photo-field">
          <div className="review-photo-field__heading">
            <div>
              <h3>Add photos</h3>
              <p>
                Optional · JPG or PNG · Maximum 3 photos · 5 MB each
              </p>
            </div>

            <span>{images.length}/3</span>
          </div>

          <div className="review-photo-list">
            {images.map((image, index) => (
              <div
                className="review-photo-preview"
                key={`${image.file.name}-${index}`}
              >
                <img
                  src={image.preview}
                  alt={`Review upload ${index + 1}`}
                />

                <button
                  type="button"
                  className="review-photo-remove"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => handleRemoveImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="review-photo-upload">
                <ImagePlus size={24} />

                <span>Add photo</span>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {imageError && (
            <p className="review-form-error">
              {imageError}
            </p>
          )}
        </div>

        {formMessage && (
          <p className="review-form-success">
            {formMessage}
          </p>
        )}

        <div className="write-review-form__actions">
          <Button
            type="submit"
            disabled={!canSubmit}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Card>
  );
}