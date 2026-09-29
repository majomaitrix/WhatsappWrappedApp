import { analyzeMessages } from '../app/utils/analyzeMessages';

describe('analyzeMessages', () => {
  const chat = `
1/1/2025, 10:00 a. m. - Alice: Hola 😀
1/1/2025, 10:15 a. m. - Bob: Hola
1/1/2025, 10:30 a. m. - Alice: https://example.com
2/1/2025, 3:00 p. m. - Bob: 😀
7/1/2025, 10:45 a. m. - Alice: Otro mensaje
  `;

  it('calculates basic chat statistics', () => {
    const result = analyzeMessages(chat);

    expect(result.countMessage).toBe(5);

    expect(result.participant1).toBe('Alice');
    expect(result.participant2).toBe('Bob');

    expect(result.participant1MessageCount).toBe(3);
    expect(result.participant2MessageCount).toBe(2);

    expect(result.participant1LinksCount).toBe(1);
    expect(result.participant2LinksCount).toBe(0);

    expect(result.mostUsedEmoji).toBe('😀');

    expect(result.monthName).toBe('enero');
    expect(result.year).toBe('2025');

    expect(result.formattedMaxHour).toBe('10 a.m.');
  });
});