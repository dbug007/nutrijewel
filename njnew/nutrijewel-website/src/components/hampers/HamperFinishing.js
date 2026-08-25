import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { CONTAINER_STYLES, NOTE_OPTIONS, NOTE_MAX_LENGTH } from '../../data/hampers';
import { formatINR } from '../../utils/hamperPricing';

/*
 * Step 3, how the finished hamper is presented.
 *
 * Container style is a separate axis from size (BOX_TIERS): any of the four
 * sizes can be a box, a tray or a basket, which is 4 + 3 things to price
 * instead of the 12 you'd get from folding style into the tiers.
 */

export default function HamperFinishing({ builder }) {
  const reduceMotion = useReducedMotion();
  const { containerStyleId, noteOptionId, noteMessage } = builder;
  const noteChosen = noteOptionId !== 'none';

  return (
    <div className="nj-finish">
      {/* ---- container style ---- */}
      <h4 className="nj-finish-label">Presented in</h4>
      <div className="nj-finish-styles" role="radiogroup" aria-label="Hamper presentation style">
        {CONTAINER_STYLES.map((style) => {
          const isActive = style.id === containerStyleId;
          return (
            <motion.button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`nj-finish-style${isActive ? ' is-active' : ''}`}
              onClick={() => builder.setContainerStyle(style.id)}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="nj-finish-style-emoji" aria-hidden="true">{style.emoji}</span>
              <span className="nj-finish-style-name">{style.name}</span>
              <span className="nj-finish-style-price">
                {style.price > 0 ? `+${formatINR(style.price)}` : 'Included'}
              </span>
              <span className="nj-finish-style-blurb">{style.blurb}</span>
              {isActive && (
                <span className="nj-finish-check" aria-hidden="true"><Check size={12} /></span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ---- note ---- */}
      <h4 className="nj-finish-label">Add a note</h4>
      <div className="nj-finish-notes" role="radiogroup" aria-label="Greeting note">
        {NOTE_OPTIONS.map((note) => {
          const isActive = note.id === noteOptionId;
          return (
            <button
              key={note.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`nj-finish-note${isActive ? ' is-active' : ''}`}
              onClick={() => builder.setNoteOption(note.id)}
              title={note.blurb}
            >
              <span className="nj-finish-note-emoji" aria-hidden="true">{note.emoji}</span>
              <span className="nj-finish-note-name">{note.name}</span>
              <span className="nj-finish-note-price">
                {note.price > 0 ? `+${formatINR(note.price)}` : 'Free'}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {noteChosen && (
          <motion.div
            className="nj-finish-message"
            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <label htmlFor="nj-note-message">
              What should it say?
              <span className="nj-finish-count">
                {noteMessage.length}/{NOTE_MAX_LENGTH}
              </span>
            </label>
            <textarea
              id="nj-note-message"
              rows={3}
              maxLength={NOTE_MAX_LENGTH}
              value={noteMessage}
              onChange={(e) => builder.setNoteMessage(e.target.value)}
              placeholder="Happy Diwali, Sharma family! Wishing you a bright and healthy year ahead., Ruchika"
            />
            <p className="nj-finish-hint">
              We hand-write this before the hamper is sealed. Leave it blank and we'll message you
              on WhatsApp to confirm the wording.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
