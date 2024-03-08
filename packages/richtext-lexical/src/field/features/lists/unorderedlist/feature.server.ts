import lexicalListImport from '@lexical/list'
const { ListItemNode, ListNode } = lexicalListImport

import type { FeatureProviderProviderServer } from '../../types.js'

import { ListHTMLConverter, ListItemHTMLConverter } from '../htmlConverter.js'
import { UnorderedListFeatureClientComponent } from './feature.client.js'
import { UNORDERED_LIST } from './markdownTransformer.js'

export const UnorderedListFeature: FeatureProviderProviderServer<undefined, undefined> = (
  props,
) => {
  return {
    feature: () => {
      return {
        ClientComponent: UnorderedListFeatureClientComponent,
        markdownTransformers: [UNORDERED_LIST],
        nodes: [
          {
            converters: {
              html: ListHTMLConverter,
            },
            node: ListNode,
          },
          {
            converters: {
              html: ListItemHTMLConverter,
            },
            node: ListItemNode,
          },
        ],
        serverFeatureProps: props,
      }
    },
    key: 'unorderedlist',
    serverFeatureProps: props,
  }
}
