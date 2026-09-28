import { useState, useEffect, useCallback } from "react";
import { CURRENT_PROVIDER_ID } from "../config/provider";
import {
  getAvailabilityRules,
  getActiveAvailabilityRules,
  createAvailabilityRule,
  updateAvailabilityRule,
  deleteAvailabilityRule,
} from "../services/availabilityService";

export default function useAvailability() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailabilityRules(CURRENT_PROVIDER_ID);
      setRules(data);
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
        const data = await getAvailabilityRules(CURRENT_PROVIDER_ID);
        if (!controller.signal.aborted) {
          setRules(data);
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
    return fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (rule) => {
      setMutating(true);
      setError(null);
      try {
        const created = await createAvailabilityRule(
          CURRENT_PROVIDER_ID,
          rule
        );
        await fetchRules();
        return created;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchRules]
  );

  const updateRule = useCallback(
    async (id, rule) => {
      setMutating(true);
      setError(null);
      try {
        const updated = await updateAvailabilityRule(
          CURRENT_PROVIDER_ID,
          id,
          rule
        );
        await fetchRules();
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchRules]
  );

  const deleteRule = useCallback(
    async (id) => {
      setMutating(true);
      setError(null);
      try {
        await deleteAvailabilityRule(CURRENT_PROVIDER_ID, id);
        await fetchRules();
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchRules]
  );

  return {
    rules,
    loading,
    mutating,
    error,
    refresh,
    createRule,
    updateRule,
    deleteRule,
  };
}
