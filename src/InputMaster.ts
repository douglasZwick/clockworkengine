import Engine from "./Engine"


export default class InputMaster
{
  Engine: Engine;

  Curr: boolean[] = [];
  Prev: boolean[] = [];
  Mode: ImMode = ImMode.Default;
  History: InputFrame[] = [];
  HistoryIndex: number = 0;

  constructor(engine: Engine)
  {
    this.Engine = engine;

    this.Curr.length = 256;
    this.Prev.length = this.Curr.length;

    for (let i = 0; i < this.Curr.length; ++i)
      this.Curr[i] = this.Prev[i] = false;
  }

  Down(key: Key): boolean
  {
    return this.Curr[key];
  }

  Up(key: Key): boolean
  {
    return !this.Curr[key];
  }

  Pressed(key: Key): boolean
  {
    return this.Curr[key] && !this.Prev[key];
  }

  Released(key: Key): boolean
  {
    return !this.Curr[key] && this.Prev[key];
  }

  OnKeyPressed(keyCode: number): boolean
  {
    // TODO:
    //   Decide how to handle whether this should be skipped
    //     during Replay
    if (this.Mode !== ImMode.Replay)
      this.Curr[keyCode] = true;
    
    // Returns false to prevent the browser's default behavior
    return false;

    // TODO:
    //   Write a keystroke-checking system that would enable me
    //     to register meaningful keystrokes, and as long as some
    //     config flag is set, this function would check to see
    //     if the key being pressed is a part of any registered
    //     keystroke. Only if it is would this function return false
  }

  OnKeyReleased(keyCode: number): boolean
  {
    if (this.Mode !== ImMode.Replay)
      this.Curr[keyCode] = false;
    
    // Returns false to prevent the browser's default behavior
    return false;
  }

  CopyFromHistory()
  {
    this.Curr.fill(false);
    for (const key of this.History[this.HistoryIndex].Keys)
      this.Curr[key] = true;

    ++this.HistoryIndex;

    if (this.HistoryIndex >= this.History.length)
      this.StopMovie();
  }

  Update()
  {
    switch (this.Mode)
    {
    default:
      this.Prev = [...this.Curr];
      break;
      
    case ImMode.Record:
      let inputFrame = new InputFrame()

      for (let i = 0; i < this.Curr.length; ++i)
      {
        let curr = this.Curr[i];
        this.Prev[i] = curr;
        if (curr)
          inputFrame.Add(i);
      }

      this.History.push(inputFrame);
      break;

    case ImMode.Replay:
      this.Prev = [...this.Curr];
      // this.CopyFromHistory();
      break;
    }
  }

  PlayMovie(movie: InputFrame[])
  {
    this.History = [...movie];
    for (let i = 0; i < this.Curr.length; ++i)
      this.Curr[i] = this.Prev[i] = false;
    this.HistoryIndex = 0;
    this.Mode = ImMode.Replay;
  }

  StopMovie()
  {
    if (this.Mode !== ImMode.Replay)
    {
      console.warn("StopMovie called when IM.Mode is not set to Replay");

      return;
    }

    console.log("Movie replay stopped");
    
    this.Mode = ImMode.Default;
    let index = (this.HistoryIndex <= this.History.length ?
      this.HistoryIndex : this.History.length) - 1;
    let finalFrame = this.History[index];

    for (const key of finalFrame.Keys)
      this.Curr[key] = false;
  }

  BeginRecording()
  {
    if (this.Mode === ImMode.Record)
    {
      console.warn("BeginRecording called when IM.Mode is already set to Record");

      return;
    }

    this.Mode = ImMode.Record;
  }

  EndRecording(): InputFrame[]
  {
    if (this.Mode !== ImMode.Record)
    {
      console.warn("EndRecording called when IM.Mode is not set to Record");

      return;
    }

    this.Mode = ImMode.Default;
    // Push one empty frame at the end of the input movie so
    //   that keys don't get "stuck" when it's done playing
    this.History.push(new InputFrame());

    return [...this.History];
  }

  SaveHistory()
  {

  }
}


export class InputFrame
{
  Keys: number[] = [];

  Add(key: number)
  {
    this.Keys.push(key);
  }

  Copy(): InputFrame
  {
    let frame = new InputFrame();
    frame.Keys = [...this.Keys];
    return frame;
  }

  Copies(copies: number): InputFrame[]
  {
    let output: InputFrame[] = [];
    output.length = copies;

    for (let i = 0; i < copies; ++i)
      output[i] = this.Copy();

    return output;
  }
}


export enum ImMode
{
  Default,
  Record,
  Replay,
}


export enum Key
{
  None            =   0,

  Break           =   3,

  Backspace       =   8,
  Tab             =   9,

  Clear           =  12,
  Enter           =  13,

  Shift           =  16,
  Control         =  17,
  Alt             =  18,
  Pause           =  19,
  CapsLock        =  20,
  Hangul          =  21,

  Hanja           =  25,

  Escape          =  27,
  Conversion      =  28,
  NonConversion   =  29,

  Space           =  32,
  PgUp            =  33,
  PgDn            =  34,
  End             =  35,
  Home            =  36,
  Left            =  37,
  Up              =  38,
  Right           =  39,
  Down            =  40,
  Select          =  41,
  Print           =  42,
  Execute         =  43,
  PrintScreen     =  44,
  Insert          =  45,
  Delete          =  46,
  Help            =  47,
  Zero            =  48,
  One             =  49,
  Two             =  50,
  Three           =  51,
  Four            =  52,
  Five            =  53,
  Six             =  54,
  Seven           =  55,
  Eight           =  56,
  Nine            =  57,
  Colon           =  58,
  SemicolonFF     =  59,
  LeftAngle       =  60,
  EqualsFF        =  61,

  Eszett          =  63,
  AtFF            =  64,
  A               =  65,
  B               =  66,
  C               =  67,
  D               =  68,
  E               =  69,
  F               =  70,
  G               =  71,
  H               =  72,
  I               =  73,
  J               =  74,
  K               =  75,
  L               =  76,
  M               =  77,
  N               =  78,
  O               =  79,
  P               =  80,
  Q               =  81,
  R               =  82,
  S               =  83,
  T               =  84,
  U               =  85,
  V               =  86,
  W               =  87,
  X               =  88,
  Y               =  89,
  Z               =  90,
  MetaLeft        =  91,

  MetaRight       =  93,

  Num0            =  96,
  Num1            =  97,
  Num2            =  98,
  Num3            =  99,
  Num4            = 100,
  Num5            = 101,
  Num6            = 102,
  Num7            = 103,
  Num8            = 104,
  Num9            = 105,
  NumTimes        = 106,
  NumPlus         = 107,
  NumPeriod       = 108,
  NumMinus        = 109,
  NumPoint        = 110,
  NumDivide       = 111,
  F1              = 112,
  F2              = 113,
  F3              = 114,
  F4              = 115,
  F5              = 116,
  F6              = 117,
  F7              = 118,
  F8              = 119,
  F9              = 120,
  F10             = 121,
  F11             = 122,
  F12             = 123,
  F13             = 124,
  F14             = 125,
  F15             = 126,
  F16             = 127,
  F17             = 128,
  F18             = 129,
  F19             = 130,
  F20             = 131,
  F21             = 132,
  F22             = 133,
  F23             = 134,
  F24             = 135,
  F25             = 136,
  F26             = 137,
  F27             = 138,
  F28             = 139,
  F29             = 140,
  F30             = 141,
  F31             = 142,
  F32             = 143,
  NumLock         = 144,
  ScrollLock      = 145,

  AirplaneMode    = 151,
  Circumflex      = 160,
  Exclamation     = 161,
  ArabicSemicolon = 162,
  Hash            = 163,
  Dollar          = 164,
  UGrave          = 165,
  PgBk            = 166,
  PgFw            = 167,
  Refresh         = 168,
  ClosingParenAZ  = 169,
  Asterisk        = 170,
  TildeAsterisk   = 171,
  HomeButton      = 172,
  Mute            = 173,
  VolumeDown      = 174,
  VolumeUp        = 175,
  Next            = 176,
  Previous        = 177,
  Stop            = 178,
  Play            = 179,
  Email           = 180,
  MuteFF          = 181,
  VolumeDownFF    = 182,
  VolumeUpFF      = 183,

  Semicolon       = 186,
  Equals          = 187,
  Comma           = 188,
  Minus           = 189,
  Period          = 190,
  Slash           = 191,
  Tilde           = 192,
  Question        = 193,
  NumPeriodChrome = 194,

  LeftBracket     = 219,
  Backslash       = 220,
  RightBracket    = 221,
  Apostrophe      = 222,
  GraveAccent     = 223,
  CommandFF       = 224,

  CCedilla        = 231,

  XF86Forward     = 233,
  XF86Back        = 234,
  
  Alphanumeric    = 240,

  Kana            = 242,
  KanaWidth       = 243,
  Kanji           = 244,

  UnlockTrackpad  = 251,

  ToggleTouchpad  = 255,
}
