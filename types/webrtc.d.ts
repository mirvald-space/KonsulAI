interface RTCPeerConnection {
  createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
  close(): void;
}

interface RTCDataChannel {
  send(data: string): void;
  close(): void;
  readyState: string;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface RTCDataChannelInit {
  ordered?: boolean;
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
  protocol?: string;
  negotiated?: boolean;
  id?: number;
  priority?: RTCPriorityType;
}

interface RTCOfferOptions {
  iceRestart?: boolean;
  offerToReceiveAudio?: boolean;
  offerToReceiveVideo?: boolean;
}

interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp: string;
}

type RTCSdpType = "answer" | "offer" | "pranswer" | "rollback";

interface RTCTrackEvent extends Event {
  readonly receiver: RTCRtpReceiver;
  readonly streams: ReadonlyArray<MediaStream>;
  readonly track: MediaStreamTrack;
  readonly transceiver: RTCRtpTransceiver;
}

interface RTCRtpReceiver {
  readonly track: MediaStreamTrack;
}

interface RTCRtpTransceiver {
  readonly direction: RTCRtpTransceiverDirection;
  readonly receiver: RTCRtpReceiver;
  readonly sender: RTCRtpSender;
}

interface RTCRtpSender {
  readonly track: MediaStreamTrack | null;
}

type RTCRtpTransceiverDirection = "sendrecv" | "sendonly" | "recvonly" | "inactive";
type RTCPriorityType = "very-low" | "low" | "medium" | "high"; 