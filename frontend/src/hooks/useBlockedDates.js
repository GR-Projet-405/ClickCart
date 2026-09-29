import { useState, useEffect, useCallback } from "react";
import { CURRENT_PROVIDER_ID } from "../config/provider";
import {
  getBlockedDates,
  createBlockedDate,
  updateBlockedDate,
  deleteBlockedDate,
} from "../services/blockedDateService";

export default function useBlockedDates() {
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlockedDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockedDates(CURRENT_PROVIDER_ID);
      setBlockedDates(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBlockedDates(CURRENT_PROVIDER_ID);
        if (!controller.signal.aborted) {
          setBlockedDates(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const refresh = useCallback(() => {
    return fetchBlockedDates();
  }, [fetchBlockedDates]);

  const create = useCallback(
    async (blockedDate) => {
      setMutating(true);
      setError(null);
      try {
        const created = await createBlockedDate(
          CURRENT_PROVIDER_ID,
          blockedDate
        );
        await fetchBlockedDates();
        return created;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchBlockedDates]
  );

  const update = useCallback(
    async (id, blockedDate) => {
      setMutating(true);
      setError(null);
      try {
        const updated = await updateBlockedDate(
          CURRENT_PROVIDER_ID,
          id,
          blockedDate
        );
        await fetchBlockedDates();
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchBlockedDates]
  );

  const remove = useCallback(
    async (id) => {
      setMutating(true);
      setError(null);
      try {
        await deleteBlockedDate(CURRENT_PROVIDER_ID, id);
        await fetchBlockedDates();
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchBlockedDates]
  );

  return {
    blockedDates,
    loading,
    mutating,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
