"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Button } from "./ui/button";

interface HomePageProps {
  onStartCall: () => void;
}

export default function HomePage({ onStartCall }: HomePageProps) {
  return (
    <motion.div
      className="fixed inset-0 p-4 flex flex-col items-center justify-center bg-background"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      }}
    >
      <motion.div
        className="text-center mb-8"
        variants={{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { delay: 0.2 } },
          exit: { opacity: 0, y: 20 },
        }}
      >
        <h1 className="text-3xl font-bold mb-2">Симулятор собеседования на Карту поляка</h1>
        <p className="text-muted-foreground">
          Подготовьтесь к экзамену с виртуальным польским консулом
        </p>
      </motion.div>
      
      <motion.div
        variants={{
          initial: { scale: 0.5 },
          enter: { scale: 1 },
          exit: { scale: 0.5 },
        }}
      >
        <Button
          className="flex items-center bg-red-500 gap-1.5 px-6 py-6 text-lg rounded-full"
          onClick={onStartCall}
        >
          <Mic className="size-5 opacity-70" />
          <span>Начать собеседование</span>
        </Button>
      </motion.div>
    </motion.div>
  );
} 