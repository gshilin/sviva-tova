import { useHydrated } from "remix-utils";
import { useEffect, useReducer, useRef } from "react";
import { clsx } from "clsx";
import { useFullscreenStatus } from "../utils/useFullscreenStatus";

const reducer = (state, action) => {
  switch (action.type) {
    case "initBitratesAndLanguages":
      return { ...state, bitrates: action.bitrates, languages: action.languages };
    case "mute":
      return { ...state, muted: !state.muted };
    case "setMessage":
      return { ...state, groupMessage: action.message };
    case "setBitrate":
      return { ...state, bitrateWebRtc: Number(action.value) };
    case "setLanguage":
      return { ...state, langWebRtc: Number(action.value) };
    case "isConnected":
      return { ...state, isConnected: true };
    case "playpause":
      return { ...state, paused: !state.paused };
    case "volume":
      return { ...state, volume: action.volume };
    default:
      throw Error("Unknown action >" + action.type + "<");
  }
};

const loadFromLocalStorage = (args) => {
  // TODO
  return args;
};

const errorHandler = () => {
  window.setTimeout(function() {
    window.location.reload();
  }, 10000);
};

const destroyHandler = () => {
  window.location.reload();
};

export const RealTimeBroadcast = ({ event }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const isHydrated = useHydrated();
  const [state, dispatch] = useReducer(reducer, {
    bitrates: null,
    languages: null,
    muted: true,
    pause: false,
    groupMessage: "&nbsp;",
    isConnected: false,
    langWebRtc: "",
    bitrateWebRtc: 0,
    volume: 100
  }, loadFromLocalStorage);

  const [isFullscreen, setIsFullscreen] = useFullscreenStatus(videoRef);

  // Initialize data
  useEffect(() => {
    if (!isHydrated) return () => {
    };
    console.log("Initialize data");
    const bitrates = getBitrates();
    const languages = getLanguages();
    dispatch({
      type: "initBitratesAndLanguages",
      bitrates,
      languages
    });
    dispatch({ type: "setBitrate", value: Object.keys(bitrates).at(0) });
    dispatch({ type: "setLanguage", value: Object.keys(languages[Object.keys(languages).at(0)]).at(0) });

    return () => {
    };
  }, [isHydrated]);

  // connect
  useEffect(() => {
      if (!isHydrated) return () => {
      };
      console.log("connect");
      janusConnect(errorHandler, destroyHandler, () => {
        dispatch({ type: "isConnected" });
      }, true);
    },
    [isHydrated, state.bitrateWebRtc, state.langWebRtc]);

  // reconnect on bitrate change
  useEffect(() => {
    if (videoRef.current && state.isConnected) {
      console.log("reconnect on bitrate change");
      janusAttachVideo(state.bitrateWebRtc, "#remoteVideo");
    }
  }, [state.bitrateWebRtc, state.isConnected, videoRef.current]);

  // reconnect on language change
  useEffect(() => {
    if (audioRef.current && state.isConnected) {
      console.log("reconnect on language change");
      janusAttachAudio(state.langWebRtc, "#remoteAudio");
      audioRef.current.muted = state.muted;
    }
    if (localStorage.langtext === "Hebrew") {
      dispatch({
        type: "setMessage",
        message: "<p>השידור בדף זה מיועד בעיקר לקבוצות שמתאספות במקום פיזי יחד וצריכות שידור ללא השהייה.</p><p>לכל צופה אשר חווה בעיות עם השידור הנ''ל או לא נצרך לשידור ללא השהייה, אנו ממליצים לצפות בשידור הרגיל שלנו בלינק הבא - <a href='https://kabbalahgroup.info/internet/he#events/299' alt='שידור חי'>שידור חי</a></p>"
      });
    } else if (localStorage.langtext === "Russian") {
      dispatch({
        type: "setMessage",
        message: "<p>Трансляция на этой странице предназначена в первую очередь для групп, которые собираются физически и требуют вещания без задержки.</p><p>Любому зрителю, который испытывает проблемы с этой трансляцией или которому не требуется трансляция без задержки, мы рекомендуем посмотреть нашу обычную трансляцию по этой ссылке - <a href=\"https://kabbalahgroup.info/internet/en#events/301\" alt=\"\">Прямая трансляция</a>"
      });
    } else {
      dispatch({
        type: "setMessage",
        message: "<p>The broadcast on this page is intended primarily for groups that gather physically together and require watching broadcast without delay.</p><p>Any viewer who experiences problems with this broadcast or is not required broadcast without delay, we recommend watching our normal broadcast following this link - <a href=\"https://kabbalahgroup.info/internet/ru#events/300\" alt=\"Live Broadcast\">Live Broadcast</a>"
      });
    }
  }, [state.langWebRtc, state.isConnected, audioRef.current]);

  // Mute/Unmute audio
  useEffect(() => {
      if (audioRef.current) {
        audioRef.current.muted = state.muted;
      }
    },
    [state.muted, audioRef.current]
  );

  // Volume
  useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = state.volume / 100;
        console.log("-----_>", audioRef.current.volume, state.volume);
      }
    },
    [state.volume, audioRef.current]
  );

  // Play/pause video
  useEffect(() => {
      if (videoRef.current) {
        if (state.paused) {
          videoRef.current.pause();
          audioRef.current.pause();
        } else {
          videoRef.current.play();
          audioRef.current.play();
        }
      }
    },
    [state.paused, videoRef.current, audioRef.current]
  );

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return <>
    <div className={
      clsx("video-js vjs-default-skin",
        state.paused ? "" : "vjs-playing")
    }>
      <div className="vjs-control-bar">
        <select
          id="bitratelist"
          value={state.bitrateWebRtc}
          onChange={(e) => dispatch({ type: "setBitrate", value: e.target.value })}
        >
          {state.bitrates && Object.keys(state.bitrates).map((key, index) => <option key={`br-${index}`} value={key}>{state.bitrates[key]}</option>)}
        </select>
        <select id="langlist"
                value={state.langWebRtc}
                onChange={(e) => dispatch({ type: "setLanguage", value: e.target.value })}
        >
          {state.languages && Object.keys(state.languages).map((key, index) =>
            <optgroup key={`lng-og-${index}`} label={key}>
              {Object.keys(state.languages[key]).map((lng, index) =>
                <option key={`lng-${index}`} value={lng}>{state.languages[key][lng]}</option>)}
            </optgroup>)
          }
        </select>
      </div>
      <div>
        <video ref={videoRef} id="remoteVideo" className="w-full" playsInline autoPlay muted={true}></video>
        <audio ref={audioRef} id="remoteAudio" autoPlay muted={true}></audio>
      </div>
      <div className="vjs-control-bar">
        <div className="grid grid-flow-col">
          <div id="playbtn" className="vjs-play-control vjs-control"
               onClick={() => dispatch({ type: "playpause" })}
          ></div>
          <div className="vjs-volume-control vjs-control">
            <div className="vjs-volume-bar vjs-slider">
              <input id="volumeslider" className="vjs-volume-level" type="range" min="0" max="100" value={state.volume} step="1"
                     onChange={(e) => dispatch({ type: "volume", volume: e.target.value })}
              />
            </div>
          </div>
          <div id="mutebtn"
               className={
                 clsx("vjs-mute-control vjs-control",
                   state.muted ? "vjs-vol-0" : "vjs-vol-3")
               }
               onClick={() => dispatch({ type: "mute" })}
          ></div>
        </div>
        <div id="fullscreenbtn" className="vjs-fullscreen-control vjs-control"
             onClick={setIsFullscreen}
        ></div>
      </div>
    </div>
    <p id="group_message" dangerouslySetInnerHTML={{
      __html: state.groupMessage
    }}></p>
  </>;
};
