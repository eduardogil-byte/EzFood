import { useCallback, useEffect, useRef, useState } from 'react';

// One request group at a time; explicit refreshes during a load request one fresh pass.
export function usePolling(load, { enabled = true, interval = 5000 } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const runner = useRef(null);
  const refresh = useCallback(() => runner.current?.(), []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    let disposed = false;
    let timer;
    let controller;
    let pending;
    let rerun = false;

    function schedule() {
      clearTimeout(timer);
      if (!disposed && !document.hidden) timer = setTimeout(() => run(), interval);
    }

    function run(force = false) {
      clearTimeout(timer);
      if (disposed) return Promise.resolve();
      if (pending) {
        if (force) rerun = true;
        return pending;
      }
      pending = (async () => {
        do {
          rerun = false;
          controller = new AbortController();
          setState((old) => ({ ...old, loading: true }));
          try {
            const data = await load(controller.signal);
            if (!disposed) setState({ data, error: null, loading: false });
          } catch (error) {
            const aborted = controller.signal.aborted;
            controller.abort(); // Cancel siblings if one request in the group failed.
            if (!disposed && !aborted) {
              setState((old) => ({ ...old, error, loading: false }));
            }
          }
        } while (rerun && !disposed && !document.hidden);
      })().finally(() => {
        pending = null;
        if (!disposed) setState((old) => ({ ...old, loading: false }));
        schedule();
      });
      return pending;
    }

    const refreshNow = () => run(true);
    runner.current = refreshNow;
    const visibility = () => {
      if (document.hidden) {
        clearTimeout(timer);
        controller?.abort();
      } else run(true);
    };
    document.addEventListener('visibilitychange', visibility);
    if (!document.hidden) run();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      if (runner.current === refreshNow) runner.current = null;
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [load, enabled, interval]);

  return { ...state, refresh };
}
