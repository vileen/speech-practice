import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanjiListItem } from '../../../components/KanjiList/KanjiListItem';
import type { KanjiItem } from '../../../components/KanjiList/types';

function makeItem(overrides: Partial<KanjiItem> = {}): KanjiItem {
  return {
    id: 'kanji-1',
    character: '水',
    meanings: ['water'],
    readings: [
      { type: 'kun', reading: 'みず' },
      { type: 'on', reading: 'スイ' },
    ],
    lesson_id: 'lesson-1',
    mnemonic: 'water flowing',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [
      {
        word: '水曜日',
        reading: 'すいようび',
        meaning: 'Wednesday',
      },
    ],
    ...overrides,
  };
}

describe('KanjiListItem', () => {
  it('renders the kanji character', () => {
    render(<KanjiListItem item={makeItem()} />);
    expect(screen.getByText('水')).toBeInTheDocument();
  });

  it('renders all meanings as tags', () => {
    render(
      <KanjiListItem
        item={makeItem({ meanings: ['water', 'Wednesday (astrology)'] })}
      />
    );
    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('Wednesday (astrology)')).toBeInTheDocument();
  });

  it('renders JLPT level badge', () => {
    render(<KanjiListItem item={makeItem({ jlpt_level: 'N4' })} />);
    expect(screen.getByText('JLPT N4')).toBeInTheDocument();
  });

  it('hides JLPT badge when jlpt_level is missing', () => {
    render(<KanjiListItem item={makeItem({ jlpt_level: undefined })} />);
    expect(screen.queryByText(/JLPT/)).not.toBeInTheDocument();
  });

  it('renders stroke count badge', () => {
    render(<KanjiListItem item={makeItem({ stroke_count: 13 })} />);
    expect(screen.getByText('13 strokes')).toBeInTheDocument();
  });

  it('hides stroke count badge when stroke_count is 0', () => {
    render(<KanjiListItem item={makeItem({ stroke_count: 0 })} />);
    expect(screen.queryByText(/strokes/)).not.toBeInTheDocument();
  });

  it('renders lesson badge', () => {
    render(<KanjiListItem item={makeItem({ lesson_id: 'lesson-42' })} />);
    expect(screen.getByText('Lesson lesson-42')).toBeInTheDocument();
  });

  it('hides lesson badge when lesson_id is empty', () => {
    render(<KanjiListItem item={makeItem({ lesson_id: '' })} />);
    expect(screen.queryByText(/Lesson/)).not.toBeInTheDocument();
  });

  it('splits readings into kunyomi and onyomi groups', () => {
    render(
      <KanjiListItem
        item={makeItem({
          readings: [
            { type: 'on', reading: 'カ' },
            { type: 'kun', reading: 'ひ' },
            { type: 'on', reading: 'ヒ' },
            { type: 'kun', reading: 'ほ' },
          ],
        })}
      />
    );

    expect(screen.getByText('Kunyomi')).toBeInTheDocument();
    expect(screen.getByText('Onyomi')).toBeInTheDocument();
    expect(screen.getByText('ひ')).toBeInTheDocument();
    expect(screen.getByText('ほ')).toBeInTheDocument();
    expect(screen.getByText('カ')).toBeInTheDocument();
    expect(screen.getByText('ヒ')).toBeInTheDocument();
  });

  it('keeps readings within their own groups (kunyomi tag not duplicated in onyomi)', () => {
    render(
      <KanjiListItem
        item={makeItem({
          readings: [
            { type: 'kun', reading: 'みず' },
            { type: 'on', reading: 'スイ' },
          ],
        })}
      />
    );

    const kunGroup = screen.getByText('Kunyomi').closest('.kanji-list-reading-group');
    const onGroup = screen.getByText('Onyomi').closest('.kanji-list-reading-group');

    expect(kunGroup).toHaveTextContent('みず');
    expect(kunGroup).not.toHaveTextContent('スイ');
    expect(onGroup).toHaveTextContent('スイ');
    expect(onGroup).not.toHaveTextContent('みず');
  });

  it('hides kunyomi group when there are no kun readings', () => {
    render(
      <KanjiListItem
        item={makeItem({
          readings: [{ type: 'on', reading: 'スイ' }],
        })}
      />
    );
    expect(screen.queryByText('Kunyomi')).not.toBeInTheDocument();
    expect(screen.getByText('Onyomi')).toBeInTheDocument();
  });

  it('hides onyomi group when there are no on readings', () => {
    render(
      <KanjiListItem
        item={makeItem({
          readings: [{ type: 'kun', reading: 'みず' }],
        })}
      />
    );
    expect(screen.queryByText('Onyomi')).not.toBeInTheDocument();
    expect(screen.getByText('Kunyomi')).toBeInTheDocument();
  });

  it('renders examples with word, reading, and meaning', () => {
    render(
      <KanjiListItem
        item={makeItem({
          examples: [
            {
              word: '水曜日',
              reading: 'すいようび',
              meaning: 'Wednesday',
            },
            {
              word: '水道',
              reading: 'すいどう',
              meaning: 'water supply',
            },
          ],
        })}
      />
    );

    expect(screen.getByText('水曜日')).toBeInTheDocument();
    expect(screen.getByText('(すいようび)')).toBeInTheDocument();
    expect(screen.getByText('— Wednesday')).toBeInTheDocument();
    expect(screen.getByText('水道')).toBeInTheDocument();
    expect(screen.getByText('(すいどう)')).toBeInTheDocument();
    expect(screen.getByText('— water supply')).toBeInTheDocument();
  });

  it('hides examples section when examples is empty', () => {
    render(<KanjiListItem item={makeItem({ examples: [] })} />);
    expect(screen.queryByText('Examples')).not.toBeInTheDocument();
  });

  it('hides examples section when examples is undefined', () => {
    render(
      <KanjiListItem item={makeItem({ examples: undefined as unknown as KanjiItem['examples'] })} />
    );
    expect(screen.queryByText('Examples')).not.toBeInTheDocument();
  });

  it('renders reading tags with kunyomi/onyomi CSS classes', () => {
    render(<KanjiListItem item={makeItem()} />);
    expect(document.querySelector('.kanji-list-reading-tag.kunyomi')).toHaveTextContent('みず');
    expect(document.querySelector('.kanji-list-reading-tag.onyomi')).toHaveTextContent('スイ');
  });

  it('renders badges with their CSS classes', () => {
    render(<KanjiListItem item={makeItem()} />);
    expect(document.querySelector('.kanji-list-badge.jlpt')).toHaveTextContent('JLPT N5');
    expect(document.querySelector('.kanji-list-badge.strokes')).toHaveTextContent('4 strokes');
    expect(document.querySelector('.kanji-list-badge.lesson')).toHaveTextContent('Lesson lesson-1');
  });
});
