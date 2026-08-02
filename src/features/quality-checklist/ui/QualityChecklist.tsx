import { useEffect, useId, useMemo, useState } from 'react';

import { createLogger } from '@/shared/lib/logger';

import {
  QUALITY_CHECKS,
  calculateProgress,
  normalizeCompletedIds,
  type QualityCheckId,
} from '../model/quality-checks';
import './quality-checklist.css';

const logger = createLogger('quality-checklist');
const DEFAULT_STORAGE_KEY = 'frontend-quality-starter:completed-checks';

type QualityChecklistProps = {
  initialCompletedIds?: readonly QualityCheckId[];
  storageKey?: string | null;
};

function restoreCompletedIds(storageKey: string | null, fallback: readonly QualityCheckId[]) {
  if (!storageKey) {
    return [...fallback];
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [...fallback];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      throw new TypeError('Stored checklist value must be an array.');
    }

    return normalizeCompletedIds(parsedValue);
  } catch (error) {
    logger.error('Checklist state could not be restored', {
      storageKey,
      error: error instanceof Error ? error.message : String(error),
    });
    return [...fallback];
  }
}

export function QualityChecklist({
  initialCompletedIds = [],
  storageKey = DEFAULT_STORAGE_KEY,
}: QualityChecklistProps) {
  const headingId = useId();
  const [completedIds, setCompletedIds] = useState<QualityCheckId[]>(() =>
    restoreCompletedIds(storageKey, initialCompletedIds),
  );
  const completedIdSet = useMemo(() => new Set(completedIds), [completedIds]);
  const progress = calculateProgress(completedIds.length);

  useEffect(() => {
    logger.debug('Checklist state observed', {
      totalChecks: QUALITY_CHECKS.length,
      completedCount: completedIds.length,
      storageEnabled: Boolean(storageKey),
    });
  }, [completedIds.length, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completedIds));
      logger.debug('Checklist state persisted', {
        completedCount: completedIds.length,
        progress,
      });
    } catch (error) {
      logger.error('Checklist state could not be persisted', {
        storageKey,
        completedCount: completedIds.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [completedIds, progress, storageKey]);

  function toggleCheck(checkId: QualityCheckId) {
    setCompletedIds((currentIds) => {
      const isCompleted = currentIds.includes(checkId);
      const nextIds = isCompleted
        ? currentIds.filter((currentId) => currentId !== checkId)
        : [...currentIds, checkId];

      logger.debug('Checklist item changed', {
        checkId,
        previousState: isCompleted ? 'completed' : 'pending',
        nextState: isCompleted ? 'pending' : 'completed',
        completedCount: nextIds.length,
        progress: calculateProgress(nextIds.length),
      });

      return nextIds;
    });
  }

  return (
    <section className="quality-tool" aria-labelledby={headingId}>
      <div className="quality-tool__intro">
        <p className="quality-tool__label">Release readiness</p>
        <h2 id={headingId}>Quality checklist</h2>
        <p>
          Complete the gates that protect a frontend release. Progress is stored in this browser.
        </p>
      </div>

      <div className="quality-tool__workspace">
        <div className="quality-tool__checks">
          <ul className="check-list">
            {QUALITY_CHECKS.map((check) => {
              const isCompleted = completedIdSet.has(check.id);
              const inputId = `${headingId}-${check.id}`;

              return (
                <li
                  className="check-list__item"
                  key={check.id}
                  data-state={isCompleted ? 'done' : 'pending'}
                >
                  <label className="check-list__control" htmlFor={inputId}>
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {
                        toggleCheck(check.id);
                      }}
                    />
                    <span className="check-list__content">
                      <span className="check-list__category">{check.category}</span>
                      <span className="check-list__title">{check.label}</span>
                      <span className="check-list__detail">{check.detail}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="quality-tool__summary" aria-label="Checklist progress">
          <div className="progress-summary">
            <span className="progress-summary__value" aria-hidden="true">
              {progress}%
            </span>
            <div>
              <p className="progress-summary__title">Release confidence</p>
              <p className="progress-summary__meta">
                {completedIds.length} of {QUALITY_CHECKS.length} gates complete
              </p>
            </div>
          </div>

          <progress
            max="100"
            value={progress}
            aria-label={`${progress}% of release checks complete`}
          />

          <p className="quality-tool__status" role="status" aria-live="polite">
            {progress === 100
              ? 'All quality gates are complete.'
              : `${QUALITY_CHECKS.length - completedIds.length} gates remain before release.`}
          </p>
        </aside>
      </div>
    </section>
  );
}
