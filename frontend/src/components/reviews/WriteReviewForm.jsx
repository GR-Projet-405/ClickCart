import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ImagePlus,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ratingLabels = {
  1: "1.0 - Poor",
  2: "2.0 - Fair",
  3: "3.0 - Good",
  4: "4.0 - Very good",
  5: "5.0 - Exceptional service!",
};

export default function WriteReviewForm() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState(
    "Kamal arrived right on time, explained the compressor issue clearly and had all required parts. He fixed our AC swiftly and left the area spotless."
  );
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const remainingSlots = MAX_IMAGES - images.length;

    setImageError("");

    const validFiles = selectedFiles.filter((file) => {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError("Only PNG and JPG images are allowed.");
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setImageError("Each image must be 5 MB or smaller.");
        return false;
      }

      return true;
    });

    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...newImages]);

    if (validFiles.length > remainingSlots) {
      setImageError("You can upload a maximum of 3 photos.");
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((current) => {
      const target = current[index];

      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!rating || !review.trim()) {
      return;
    }

    setFormMessage(
      "Review validated successfully. Backend submission will be connected later."
    );
  };

  return (
    <section
      className="write-review-module"
      id="review-form-anchor"
    >
      <div className="write-review-module__banner">
        <div className="write-review-module__banner-left">
          <div className="write-review-module__icon">
            <PencilLine size={17} />
          </div>

          <div>
            <h2>Leave a Review for Kamal Perera</h2>

            <p>
              Service: AC Repair &amp; Installation • Completed on Mar 10,
              2026
            </p>
          </div>
        </div>

        <span className="write-review-module__verified-order">
          <CheckCircle2 size={15} />
          Verified Order
        </span>
      </div>

      <form className="write-review-form" onSubmit={handleSubmit}>
        <div className="write-review-form__field">
          <label>Overall Rating *</label>

          <div className="write-review-rating-row">
            <div
              className="write-review-rating"
              role="radiogroup"
              aria-label="Overall rating"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onClick={() => setRating(value)}
                >
                  <Star
                    size={32}
                    fill={value <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <span className="write-review-rating-label">
                {ratingLabels[rating]}
              </span>
            )}
          </div>
        </div>

        <div className="write-review-form__field">
          <div className="write-review-form__label-row">
            <label htmlFor="review-content">
              How was your experience? *
            </label>

            <span>
              {review.length} / 500 characters
            </span>
          </div>

          <textarea
            id="review-content"
            rows={4}
            maxLength={500}
            value={review}
            placeholder="Tell us about the provider punctuality, quality of work, cleanliness, and communication..."
            onChange={(event) => setReview(event.target.value)}
          />
        </div>

        <div className="write-review-form__field">
          <label>
            Add Photos
            <span className="write-review-form__optional">
              {" "}
              (Optional, max 3 photos)
            </span>
          </label>

          <div className="write-review-photo-grid">
            {images.map((image, index) => (
              <div
                key={`${image.file.name}-${index}`}
                className="write-review-photo"
              >
                <img
                  src={image.preview}
                  alt={`Review upload ${index + 1}`}
                />

                <span>{image.file.name}</span>

                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => handleRemoveImage(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="write-review-upload">
                <ImagePlus size={25} />

                <strong>Upload Photo</strong>

                <span>PNG, JPG up to 5MB</span>

                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {imageError && (
            <p className="review-form-error">{imageError}</p>
          )}
        </div>

        <aside className="ai-review-assistant">
          <div className="ai-review-assistant__icon">
            <Sparkles size={20} />
          </div>

          <div className="ai-review-assistant__content">
            <div className="ai-review-assistant__heading">
              <h3>
                AI Review Assistant
                <span>Privacy Safe</span>
              </h3>

              <strong>Original meaning strictly preserved</strong>
            </div>

            <p>
              Need help expressing your experience? AI can improve the
              clarity and grammar of your review while keeping your authentic
              evaluation completely unchanged.
            </p>

            <div className="ai-review-assistant__actions">
              <button type="button">
                <Sparkles size={14} />
                Improve Writing
              </button>

              <button type="button">
                <Search size={14} />
                Make it Clearer
              </button>

              <button type="button">
                <ShieldCheck size={14} />
                Check Review
              </button>
            </div>

            <small>
              <em>Note:</em> AI suggestions are optional. You are always in
              control of your final review. AI will not invent experiences,
              falsify ratings, or alter your sentiment.
            </small>
          </div>
        </aside>

        <aside className="review-safety-check">
          <div className="review-safety-check__header">
            <div>
              <h4>
                <ShieldCheck size={16} />
                Automated Review Safety Pre-Check
              </h4>

              <p>
                Content passes our community moderation standards in
                real-time.
              </p>
            </div>

            <span className="review-safety-check__status">
              <span />
              Ready to Publish
            </span>
          </div>

          <div className="review-safety-check__items">
            {[
              "No abusive language",
              "No private phone / email",
              "No spam or links",
              "Relevant to completed job",
            ].map((item) => (
              <div key={item}>
                <Check size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="review-safety-check__preview">
            <div>
              <AlertTriangle size={16} />

              <span>
                <strong>Sample Moderation Feedback:</strong>{" "}
                Some wording may violate community standards. Highlighted
                text will require revision before publishing.
              </span>
            </div>

            <span>Preview Only</span>
          </div>
        </aside>

        {formMessage && (
          <p className="review-form-success">{formMessage}</p>
        )}

        <div className="write-review-form__actions">
          <button
            className="write-review-form__cancel"
            type="button"
            onClick={() => {
              setRating(0);
              setReview("");
              setFormMessage("");
            }}
          >
            Cancel
          </button>

          <button
            className="write-review-form__submit"
            type="submit"
            disabled={!rating || !review.trim()}
          >
            <Check size={16} />
            Submit Verified Review
          </button>
        </div>
      </form>
    </section>
  );
}