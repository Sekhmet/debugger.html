/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type {
  Source,
  Breakpoint,
  Expression,
  LoadedObject,
  Location,
  Frame,
  Scope,
  Why,
  Worker
} from "../types";

import type { PromiseAction } from "./utils/middleware/promise";

import type { State, Command } from "../reducers/types";

import type {
  ActiveSearchType,
  OrientationType,
  SelectedPrimaryPaneTabType
} from "../reducers/ui";

import type { MatchedLocations } from "../reducers/file-search";

import type {
  SymbolDeclarations,
  AstLocation,
  PausePoint
} from "../workers/parser";

import type { SourceMetaDataType } from "../reducers/ast.js";

/**
 * Flow types
 * @module actions/types
 */

/**
 * Argument parameters via Thunk middleware for {@link https://github.com/gaearon/redux-thunk|Redux Thunk}
 *
 * @memberof actions/breakpoints
 * @static
 * @typedef {Object} ThunkArgs
 */
export type ThunkArgs = {
  dispatch: (action: any) => Promise<any>,
  getState: () => State,
  client: any,
  sourceMaps: any,
  openLink: (url: string) => void,
  openWorkerToolbox: (worker: Worker) => void
};

export type Thunk = ThunkArgs => any;

export type ActionType = Object | Function;

/**
 * Tri-state status for async operations
 *
 * Available options are:
 * `"start"` or `"done"` or `"error"`
 *
 * @memberof actions/types
 * @static
 * @enum
 */
export type AsyncStatus = "start" | "done" | "error";

type AddBreakpointResult = {
  previousLocation: Location,
  breakpoint: Breakpoint
};

type ProjectTextSearchResult = {
  sourceId: string,
  filepath: string,
  matches: MatchedLocations[]
};

type BreakpointAction =
  | PromiseAction<
      {|
        +type: "ADD_BREAKPOINT",
        +breakpoint: Breakpoint,
        +condition?: string
      |},
      AddBreakpointResult
    >
  | PromiseAction<{|
      +type: "REMOVE_BREAKPOINT",
      +breakpoint: Breakpoint,
      +disabled: boolean
    |}>
  // for simulating a successful server request
  | {|
      +type: "REMOVE_BREAKPOINT",
      +breakpoint: Breakpoint,
      +status: "done"
    |}
  | {|
      +type: "SET_BREAKPOINT_CONDITION",
      +breakpoint: Breakpoint
    |}
  | PromiseAction<{|
      +type: "TOGGLE_BREAKPOINTS",
      +shouldDisableBreakpoints: boolean
    |}>
  | {|
      +type: "SYNC_BREAKPOINT",
      +breakpoint: ?Breakpoint,
      +previousLocation: Location
    |}
  | PromiseAction<
      {|
        +type: "ENABLE_BREAKPOINT",
        +breakpoint: Breakpoint
      |},
      AddBreakpointResult
    >
  | {|
      +type: "DISABLE_BREAKPOINT",
      +breakpoint: Breakpoint
    |}
  | {|
      +type: "DISABLE_ALL_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |}
  | {|
      +type: "ENABLE_ALL_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |}
  | {|
      +type: "REMAP_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |};

type SourceAction =
  | {| type: "ADD_SOURCE", source: Source |}
  | {| type: "ADD_SOURCES", sources: Array<Source> |}
  | {| type: "UPDATE_SOURCE", source: Source |}
  | {|
      type: "SELECT_SOURCE",
      source: Source,
      location?: { line?: number, column?: number }
    |}
  | {| type: "SELECT_SOURCE_URL", url: string, line?: number |}
  | {|
      type: "LOAD_SOURCE_TEXT",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: Source
    |}
  | {| type: "CLEAR_SELECTED_SOURCE" |}
  | {|
      type: "BLACKBOX",
      source: Source,
      error: string,
      value: { isBlackBoxed: boolean }
    |}
  | {| type: "ADD_TAB", source: Source, tabIndex: number |}
  | {| type: "MOVE_TAB", url: string, tabIndex: number |}
  | {| type: "CLOSE_TAB", url: string, tabs: any |}
  | {| type: "CLOSE_TABS", urls: string[], tabs: any |};

export type panelPositionType = "start" | "end";

type UIAction =
  | {|
      type: "TOGGLE_ACTIVE_SEARCH",
      value: ?ActiveSearchType
    |}
  | {|
      type: "OPEN_QUICK_OPEN",
      query?: string
    |}
  | {|
      type: "CLOSE_QUICK_OPEN"
    |}
  | {|
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value: boolean
    |}
  | {|
      type: "SHOW_SOURCE",
      sourceUrl: string
    |}
  | {|
      type: "TOGGLE_PANE",
      position: panelPositionType,
      paneCollapsed: boolean
    |}
  | {|
      type: "SET_CONTEXT_MENU",
      contextMenu: { type: string, event: any }
    |}
  | {|
      type: "SET_ORIENTATION",
      orientation: OrientationType
    |}
  | {|
      type: "HIGHLIGHT_LINES",
      location: {
        start: number,
        end: number,
        sourceId: number
      }
    |}
  | {|
      type: "CLEAR_HIGHLIGHT_LINES"
    |}
  | {|
      type: "OPEN_CONDITIONAL_PANEL",
      line: number
    |}
  | {|
      type: "CLOSE_CONDITIONAL_PANEL"
    |}
  | {|
      type: "SET_PROJECT_DIRECTORY_ROOT",
      url: Object
    |}
  | {|
      type: "SET_PRIMARY_PANE_TAB",
      tabName: SelectedPrimaryPaneTabType
    |}
  | {|
      type: "CLOSE_PROJECT_SEARCH"
    |};

type ReplayAction =
  | {|
      type: "TRAVEL_TO",
      data: {
        paused: {
          why: Why,
          scopes: Scope[],
          frames: Frame[],
          selectedFrameId: string,
          loadedObjects: Object
        },
        expressions?: Object[]
      },
      position: number
    |}
  | {|
      type: "CLEAR_HISTORY"
    |};

type PauseAction =
  | {| type: "BREAK_ON_NEXT", value: boolean |}
  | {| type: "RESUME", value: void |}
  | {|
      type: "PAUSED",
      why: Why,
      scopes: Scope,
      frames: Frame[],
      selectedFrameId: string,
      loadedObjects: LoadedObject[]
    |}
  | {|
      type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions: boolean,
      shouldIgnoreCaughtExceptions: boolean
    |}
  | {| type: "COMMAND", status: AsyncStatus, command: Command |}
  | {| type: "SELECT_FRAME", frame: Frame |}
  | {|
      type: "SET_POPUP_OBJECT_PROPERTIES",
      objectId: string,
      properties: Object
    |}
  | {|
      type: "ADD_EXPRESSION",
      id: number,
      input: string,
      value: string,
      expressionError: ?string
    |}
  | {|
      type: "EVALUATE_EXPRESSION",
      input: string,
      value: Object,
      "@@dispatch/promise": any
    |}
  | {|
      type: "EVALUATE_EXPRESSIONS",
      results: Expression[],
      inputs: string[],
      "@@dispatch/promise": any
    |}
  | {|
      type: "UPDATE_EXPRESSION",
      expression: Expression,
      input: string,
      expressionError: ?string
    |}
  | {|
      type: "DELETE_EXPRESSION",
      input: string
    |}
  | {| type: "CLEAR_EXPRESSION_ERROR" |}
  | {|
      type: "MAP_SCOPES",
      frame: Frame,
      status: AsyncStatus,
      value: {
        scope: Scope,
        mappings: {
          [string]: string | null
        }
      }
    |}
  | {|
      type: "MAP_FRAMES",
      frames: Frame[]
    |}
  | {|
      type: "ADD_EXTRA",
      extra: any
    |}
  | {|
      type: "ADD_SCOPES",
      frame: Frame,
      status: AsyncStatus,
      value: Scope
    |};

type NavigateAction =
  | {| type: "CONNECT", url: string, canRewind: boolean |}
  | {| type: "NAVIGATE", url: string |};

export type ASTAction =
  | PromiseAction<
      {|
        +type: "SET_SYMBOLS",
        +source: Source
      |},
      SymbolDeclarations
    >
  | {|
      +type: "SET_PAUSE_POINTS",
      +source: Source,
      +pausePoints: PausePoint[]
    |}
  | {|
      +type: "OUT_OF_SCOPE_LOCATIONS",
      +locations: ?(AstLocation[])
    |}
  | {|
      +type: "IN_SCOPE_LINES",
      +lines: AstLocation[]
    |}
  | PromiseAction<
      {|
        +type: "SET_PREVIEW"
      |},
      {
        expression: string,
        result: any,
        location: AstLocation,
        tokenPos: any,
        cursorPos: any,
        extra: any
      }
    >
  | {|
      +type: "SET_SOURCE_METADATA",
      +sourceId: string,
      +sourceMetaData: SourceMetaDataType
    |}
  | {|
      +type: "CLEAR_SELECTION"
    |};

export type SourceTreeAction = {| type: "SET_EXPANDED_STATE", expanded: any |};

export type ProjectTextSearchAction =
  | {| type: "ADD_QUERY", query: string |}
  | {|
      type: "ADD_SEARCH_RESULT",
      result: ProjectTextSearchResult
    |}
  | {| type: "CLEAR_QUERY" |}
  | {| type: "UPDATE_STATUS", status: string |}
  | {| type: "CLEAR_SEARCH_RESULTS" |}
  | {| type: "CLEAR_SEARCH" |};

export type FileTextSearchAction =
  | {|
      type: "TOGGLE_FILE_SEARCH_MODIFIER",
      modifier: "caseSensitive" | "wholeWord" | "regexMatch"
    |}
  | {|
      type: "UPDATE_FILE_SEARCH_QUERY",
      query: string
    |}
  | {|
      type: "UPDATE_SEARCH_RESULTS",
      results: {
        matches: MatchedLocations[],
        matchIndex: number,
        count: number,
        index: number
      }
    |};

export type QuickOpenAction =
  | {| type: "SET_QUICK_OPEN_QUERY", query: string |}
  | {| type: "OPEN_QUICK_OPEN", query?: string |}
  | {| type: "CLOSE_QUICK_OPEN" |};

export type CoverageAction = {|
  type: "RECORD_COVERAGE",
  value: { coverage: Object }
|};

export type DebugeeAction = {|
  type: "SET_WORKERS",
  workers: {
    workers: Object[]
  }
|};

export type {
  StartPromiseAction,
  DonePromiseAction,
  ErrorPromiseAction
} from "./utils/middleware/promise";

/**
 * Actions: Source, Breakpoint, and Navigation
 *
 * @memberof actions/types
 * @static
 */
export type Action =
  | SourceAction
  | BreakpointAction
  | PauseAction
  | NavigateAction
  | UIAction
  | ASTAction
  | QuickOpenAction
  | FileTextSearchAction
  | ProjectTextSearchAction
  | CoverageAction
  | DebugeeAction
  | ReplayAction;
