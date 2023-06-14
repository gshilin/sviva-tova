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
      return { ...state, bitrateWebRtc: action.value };
    case "setLanguage":
      return { ...state, langWebRtc: action.value };
    default:
      throw Error("Unknown action >" + action.type + "<");
  }
};

export const RealTimeBroadcast = ({ event }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const isHydrated = useHydrated();
  const [state, dispatch] = useReducer(reducer, {
    bitrates: null,
    languages: null,
    muted: true,
    groupMessage: "&nbsp;",
    isConnected: false,
    langWebRtc: null,
    bitrateWebRtc: 0
  });

  const [isFullscreen, setIsFullscreen] = useFullscreenStatus(videoRef);

  // Initialize data
  useEffect(() => {
    if (!isHydrated) return () => {
    };
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
  }, [event, isHydrated]);

  // reconnect on bitrate change
  useEffect(() => {
    if (videoRef.current && state.isConnected) {
      janusAttachVideo(state.bitrateWebRtc, "#remoteVideo");
    }
  }, [state.bitrateWebRtc, state.isConnected, videoRef.current]);

  // reconnect on language change
  useEffect(() => {
    if (videoRef.current && state.isConnected) {
      janusAttachAudio(state.langWebRtc, "#remoteAudio");
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
  }, [state.langWebRtc, state.isConnected, videoRef.current]);

  // Mute/Unmute audio
  useEffect(() => {
      if (audioRef.current) {
        audioRef.current.muted = state.muted;
      }
    },
    [state.muted, audioRef.current]
  );

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return <>
    <div className="video-js vjs-default-skin">
      <div className="vjs-control-bar vjs-control-bar-top">
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
      <video ref={videoRef} id="remoteVideo" playsInline autoPlay muted></video>
      <audio ref={audioRef} id="remoteAudio" autoPlay></audio>
      <div className="vjs-control-bar">
        <div id="fullscreenbtn" className="vjs-fullscreen-control vjs-control"
             onClick={setIsFullscreen}
        ></div>
        <div className="vjs-volume-control vjs-control">
          <div className="vjs-volume-bar vjs-slider">
            {/* TODO: add handler*/}
            <input id="volumeslider" className="vjs-volume-level" type="range" min="0" max="100" defaultValue="100" step="1" />
          </div>
        </div>
        <div id="mutebtn"
             className={
               clsx("vjs-mute-control vjs-control",
                 state.muted && "vjs-vol-0",
                 !state.muted && "vjs-vol-3")
             }
             onClick={() => dispatch({ type: "mute" })}
        ></div>
      </div>
    </div>
    <p id="group_message" dangerouslySetInnerHTML={{
      __html: state.groupMessage
    }}></p>
  </>;
};
