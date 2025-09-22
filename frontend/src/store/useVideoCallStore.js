import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const useVideoCallStore = create(
  subscribeWithSelector((set, get) => ({
    // call state
    currentCall: null,
    incomingCall: null,
    isCallerActive: false,
    callType: null,

    // media state
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,

    // WebRtc
    peerConnection: null,
    iceCandidatesQueue: [],

    isCallModalOpen: false,
    callStatus: "idle",

    // methods

    setCurrentCall: (call) => {
      set({ currentCall: call });
    },
    setIncomingCall: (call) => {
      set({ incomingCall: call });
    },
    setCallActive: (active) => {
      set({ isCallerActive: active });
    },
    setCallType: (type) => {
      set({ callType: type });
    },
    setLocalStream: (stream) => {
      set({ localStream: stream });
    },
    setRemoteStream: (stream) => {
      set({ remoteStream: stream });
    },
    setPeerConnection: (pc) => {
      set({ peerConnection: pc });
    },
    setCallModalOpen: (open) => {
      set({ isCallModalOpen: open });
    },
    setCallStatus: (status) => {
      set({ callStatus: status });
    },
    addIceCandidate: (candidate) => {
      const { iceCandidatesQueue } = get();
      set({ iceCandidatesQueue: [...iceCandidatesQueue, candidate] });
    },
    processQueuedIceCandidates: async () => {
      const { peerConnection, iceCandidatesQueue } = get();

      if (
        peerConnection &&
        peerConnection.remoteDescription &&
        iceCandidatesQueue.length > 0
      ) {
        for (const candidate of iceCandidatesQueue) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error("ICE candidate error", error);
          }
        }
        set({ iceCandidatesQueue: [] });
      }
    },
    // toggleVideo: () => {
    //   const { localStream, isVideoEnabled } = get();
    //   if (localStream) {
    //     const videoTrack = localStream.getVideoTracks()[0];
    //     if (videoTrack) {
    //       videoTrack.enabled = !isVideoEnabled;
    //       set({ isVideoEnabled: !isVideoEnabled });
    //     }
    //   }
    // },
    toggleAudio: () => {
      const { localStream, isAudioEnabled } = get();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isAudioEnabled;
          set({ isAudioEnabled: !isAudioEnabled });
        }
      }
    },
    toggleVideo: () => {
      set((state) => {
        if (!state.localStream) return state;

        const videoTrack = state.localStream.getVideoTracks()[0];
        if (!videoTrack) return state;

        const newStatus = !state.isVideoEnabled;
        videoTrack.enabled = newStatus;

        return { isVideoEnabled: newStatus };
      });
    },
    endCall: () => {
      const { localStream, peerConnection } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection) {
        // peerConnection.ontrack = null;
        // peerConnection.onicecandidate = null;
        // peerConnection.onconnectionstatechange = null;
        peerConnection.close();
      }

      set({
        currentCall: null,
        incomingCall: null,
        isCallerActive: false,
        callType: null,
        localStream: null,
        remoteStream: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
        peerConnection: null,
        iceCandidatesQueue: [],
        isCallModalOpen: false,
        callStatus: "idle",
      });
    },
    clearIncoming: () => {
      set({ incomingCall: null });
    },
  }))
);

export default useVideoCallStore;
