/// <reference types="@dcloudio/types" />
/// <reference types="node" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
} 