import 'jasmine';

import { DevOpsStory } from './devops';

describe('devops', () => {
  it('creates story from message', () => {
    // Create mock message
    const msg: any = {
      cleanContent: '@devops how do build form?',
      client: {
        users: {
          cache: [
            { id: 'krische', username: 'krische' },
            { id: 'freedeau', username: 'freedeau' },
          ],
        },
      },
    };

    const story = DevOpsStory.fromMessage(msg);

    expect(story.assignee.id).toMatch(/krische|freedeau/);
    expect(story.description).toEqual('how do build form?');
    expect(story.id).toBeGreaterThanOrEqual(1000);
    expect(story.id).toBeLessThanOrEqual(9999);
    expect(story.points).toMatch(/2|3|5|8|13/);
  });
});
