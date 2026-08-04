/**
 * Per-socket AI "turn" registry.
 *
 * A turn is one AI response (LLM stream + the TTS segments it produces).
 * Only one turn may be live at a time: when the learner interrupts or speaks
 * again, the previous turn is cancelled so its already-scheduled TTS callbacks
 * never emit. Without this, audio from an abandoned turn plays over the new one
 * — the classic "the AI keeps talking after I cut in" bug.
 *
 * @param {(event: string, payload: any) => void} emit - socket emit function
 */
export function createTurnRegistry(emit) {
  const turns = new Map();

  const cancelAll = () => {
    for (const turn of turns.values()) turn.cancelled = true;
    turns.clear();
  };

  return {
    /** Start a turn, superseding any still in flight. */
    begin(requestId) {
      cancelAll();
      const turn = { requestId, cancelled: false };
      turns.set(requestId, turn);
      return turn;
    },

    /** Cancel one turn, or all of them when requestId is omitted. */
    cancel(requestId) {
      if (!requestId) return cancelAll();
      const turn = turns.get(requestId);
      if (turn) {
        turn.cancelled = true;
        turns.delete(requestId);
      }
    },

    cancelAll,

    /** Finish a turn normally. */
    end(requestId) {
      turns.delete(requestId);
    },

    /**
     * Emit only while the turn is still live.
     * @returns {boolean} whether the event was actually sent
     */
    emitFor(turn, event, payload) {
      if (!turn || turn.cancelled) return false;
      emit(event, payload);
      return true;
    },

    /** Number of live turns — for tests/diagnostics. */
    get size() {
      return turns.size;
    }
  };
}

export default createTurnRegistry;
