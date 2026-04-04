import { describe, it, expect } from 'vitest';
import type {
  Property,
  TextProperty,
  BoolProperty,
  RelationProperty,
  Editable,
  RichTextEditable,
  CrossroadBlockEditable,
  ContentBlock,
  CrossroadContentBlock,
  HighlightContentBlock,
  ImageContentBlock,
} from '../src/types';

describe('Property discriminated union deserialization', () => {
  it('deserializes a TextProperty from raw JSON', () => {
    const raw: unknown = { type: 'text', name: 'site_name', value: 'My Site' };
    const property = raw as Property;

    expect(property.type).toBe('text');
    if (property.type === 'text' || property.type === 'select') {
      const textProp = property as TextProperty;
      expect(textProp.name).toBe('site_name');
      expect(textProp.value).toBe('My Site');
    }
  });

  it('deserializes a SelectProperty from raw JSON', () => {
    const raw: unknown = { type: 'select', name: 'layout', value: 'full-width' };
    const property = raw as Property;

    expect(property.type).toBe('select');
    if (property.type === 'text' || property.type === 'select') {
      expect(property.value).toBe('full-width');
    }
  });

  it('deserializes a BoolProperty from raw JSON', () => {
    const raw: unknown = { type: 'bool', name: 'is_featured', valueBool: true };
    const property = raw as Property;

    expect(property.type).toBe('bool');
    if (property.type === 'bool') {
      const boolProp = property as BoolProperty;
      expect(boolProp.valueBool).toBe(true);
    }
  });

  it('deserializes a RelationProperty (document) from raw JSON', () => {
    const raw: unknown = { type: 'document', name: 'related_page', id: 42, path: '/about' };
    const property = raw as Property;

    expect(property.type).toBe('document');
    if (property.type === 'document' || property.type === 'asset' || property.type === 'object') {
      const relProp = property as RelationProperty;
      expect(relProp.id).toBe(42);
      expect(relProp.path).toBe('/about');
    }
  });

  it('deserializes a RelationProperty with null id and path', () => {
    const raw: unknown = { type: 'asset', name: 'image', id: null, path: null };
    const property = raw as Property;

    if (property.type === 'asset') {
      const relProp = property as RelationProperty;
      expect(relProp.id).toBeNull();
      expect(relProp.path).toBeNull();
    }
  });
});

describe('Editable discriminated union deserialization', () => {
  it('deserializes a RichTextEditable from raw JSON', () => {
    const raw: unknown = { type: 'rich-text', order: 1, content: '<p>Hello world</p>' };
    const editable = raw as Editable;

    expect(editable.type).toBe('rich-text');
    if (editable.type === 'rich-text') {
      const richText = editable as RichTextEditable;
      expect(richText.order).toBe(1);
      expect(richText.content).toBe('<p>Hello world</p>');
    }
  });

  it('deserializes a CrossroadBlockEditable from raw JSON', () => {
    const raw: unknown = {
      type: 'crossroad-block',
      order: 2,
      items: [
        {
          title: 'Block Title',
          text: 'Block text',
          imagePosition: 'left',
          linkHref: '/link',
          linkText: 'Read more',
          image: { src: '/images/10/thumb.jpg', alt: 'Test', title: '', sources: [], width: 800, height: 600 },
        },
      ],
    };
    const editable = raw as Editable;

    expect(editable.type).toBe('crossroad-block');
    if (editable.type === 'crossroad-block') {
      const block = editable as CrossroadBlockEditable;
      expect(block.items).toHaveLength(1);
      expect(block.items[0].title).toBe('Block Title');
    }
  });
});

describe('ContentBlock discriminated union deserialization', () => {
  it('deserializes a CrossroadContentBlock from raw JSON', () => {
    const raw: unknown = {
      type: 'crossroad-block',
      order: 1,
      items: [
        {
          title: 'Crossroad Title',
          text: 'Some text',
          reverseContent: true,
          linkHref: null,
          linkText: null,
          image: null,
        },
      ],
    };
    const block = raw as ContentBlock;

    expect(block.type).toBe('crossroad-block');
    if (block.type === 'crossroad-block') {
      const crossroad = block as CrossroadContentBlock;
      expect(crossroad.items[0].reverseContent).toBe(true);
    }
  });

  it('deserializes a HighlightContentBlock from raw JSON', () => {
    const raw: unknown = {
      type: 'highlight',
      order: 2,
      items: [
        { title: 'Highlight', text: 'Content', image: { src: '/images/5/thumb.jpg', alt: 'Highlight', title: '', sources: [], width: 400, height: 300 } },
      ],
    };
    const block = raw as ContentBlock;

    expect(block.type).toBe('highlight');
    if (block.type === 'highlight') {
      const highlight = block as HighlightContentBlock;
      expect(highlight.items[0].image?.src).toBe('/images/5/thumb.jpg');
    }
  });

  it('deserializes an ImageContentBlock from raw JSON', () => {
    const raw: unknown = { type: 'image', order: 3, image: { src: '/images/99/thumb.jpg', alt: 'Image block', title: '', sources: [], width: 1200, height: 630 } };
    const block = raw as ContentBlock;

    expect(block.type).toBe('image');
    if (block.type === 'image') {
      const image = block as ImageContentBlock;
      expect(image.image?.src).toBe('/images/99/thumb.jpg');
    }
  });

  it('deserializes an ImageContentBlock with null image', () => {
    const raw: unknown = { type: 'image', order: 1, image: null };
    const block = raw as ContentBlock;

    if (block.type === 'image') {
      expect(block.image).toBeNull();
    }
  });
});
