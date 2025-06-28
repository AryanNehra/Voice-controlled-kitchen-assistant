import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { Mic, MicOff, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, Clock, ChefHat, BookOpen } from 'lucide-react';

export default function VoiceKitchenAssistant() {
  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const speechRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const timeLeftRef = useRef(0);
  const isPausedRef = useRef(false);
  const recipeRef = useRef(null);
  const currentStepRef = useRef(0);
  const isListeningRef = useRef(false);
  const [awaitingTimerConfirmation, setAwaitingTimerConfirmation] = useState(false);
  const awaitingTimerConfirmationRef = useRef(false);
  const [ingredientsSpoken, setIngredientsSpoken] = useState(false);
  const ingredientsSpokenRef = useRef(false);

  const sampleRecipe = {
    title: "Classic Chocolate Chip Cookies",
    summary: "Delicious homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.",
    sourceUrl: "#",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1/2 teaspoon salt",
      "1 cup (2 sticks) unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "1 teaspoon vanilla extract",
      "2 large eggs",
      "2 cups chocolate chips"
    ],

    instructions: [
      { text: "Preheat your oven to 375 degrees Fahrenheit", time: 0.5 },
      { text: "In a large bowl, cream together butter and sugars until light and fluffy", time: 1 },
      { text: "Beat in eggs one at a time, then add vanilla extract", time: 1 },
      { text: "In a separate bowl, whisk together flour, baking soda, and salt", time: 1.5 },
      { text: "Gradually mix the dry ingredients into the wet ingredients", time: 0.5 },
      { text: "Fold in the chocolate chips until evenly distributed", time: 1 },
      { text: "Drop rounded tablespoons of dough onto ungreased baking sheets", time: 4 },
      { text: "Bake for 9 to 11 minutes or until golden brown", time: 1.1 },
      { text: "Cool on baking sheet for 2 minutes, then transfer to wire rack", time: 1 },
    ]
  };

  useEffect(() => {
    const saved = localStorage.getItem('loadedRecipe');
    if (saved) {
      setRecipe(JSON.parse(saved));
      localStorage.removeItem('loadedRecipe');
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript.trim()) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };

    }
  }, [isListening]);

  useEffect(() => {
    recipeRef.current = recipe;
  }, [recipe]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    awaitingTimerConfirmationRef.current = awaitingTimerConfirmation;
  }, [awaitingTimerConfirmation]);

  useEffect(() => {
    ingredientsSpokenRef.current = ingredientsSpoken;
  }, [ingredientsSpoken]);

  const processVoiceCommand = async (command) => {
    setLastCommand(command);

    const lowerCommand = command.toLowerCase().trim();

    if (awaitingTimerConfirmationRef.current && lowerCommand.includes('yes')) {
      setAwaitingTimerConfirmation(false);
      awaitingTimerConfirmationRef.current = false;

      const step = recipeRef.current?.instructions?.[currentStepRef.current];
      if (step?.time > 0) {
        startTimer(step.time);
      }

      const utter = new SpeechSynthesisUtterance("Starting timer now.");
      speechSynthesis.speak(utter);

      return;
    }

    if (awaitingTimerConfirmationRef.current && lowerCommand.includes('no')) {
      setAwaitingTimerConfirmation(false);
      awaitingTimerConfirmationRef.current = false;

      const utter = new SpeechSynthesisUtterance("Okay, skipping the timer.");
      speechSynthesis.speak(utter);

      return;
    }


    if (lowerCommand.includes('next') || lowerCommand.includes('skip')) {
      skipStep();
    } else if (lowerCommand.includes('repeat') || lowerCommand.includes('again')) {
      await repeatStep();
    } else if (lowerCommand.includes('pause') || lowerCommand.includes('stop timer') || lowerCommand.includes('hold')) {
      pauseTimer();
    } else if (lowerCommand.includes('resume') || lowerCommand.includes('continue') || lowerCommand.includes('start timer') || lowerCommand.includes('unpause')) {
      resumeTimer();
    } else if (lowerCommand.includes('stop speaking') || lowerCommand.includes('quiet') || lowerCommand.includes('silence') || lowerCommand.includes('stop voice')) {
      stopSpeaking();
    } else if (lowerCommand.includes('recipe for')) {
      fetchRecipeFromAPI(command);
    } else if (lowerCommand.includes('save recipe') && recipeRef.current) {
      saveRecipe();
    } else if (lowerCommand.includes('start recipe') || lowerCommand.includes('begin cooking') || lowerCommand.includes('load recipe')) {
      if (!recipe) setRecipe(sampleRecipe);
    } else if (lowerCommand.includes('restart') || lowerCommand.includes('start over')) {
      restartRecipe();
    } else {
      console.log('Command not recognized:', lowerCommand);
    }
  };

  const fetchRecipeFromAPI = async (command) => {
    const item = command.split('recipe for')[1]?.trim();
    if (!item) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/recipes/search/${item}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipe(res.data);
      recipeRef.current = res.data;
      setCurrentStep(0);

      const speakText = `Here is your recipe for ${item}`;
      const utterance = new SpeechSynthesisUtterance(speakText);
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Recipe fetch error:', err);
      let msg = "Sorry, I couldn't find a recipe for that.";
      if (err?.response?.status === 404) {
        msg = `Sorry, I couldn't find any recipe for ${item}. Please try something else.`;
      }

      const utterance = new SpeechSynthesisUtterance(msg);
      speechSynthesis.speak(utterance);
    }
  };

  const saveRecipe = async () => {
    const token = localStorage.getItem('token');
    const currentRecipe = recipeRef.current;

    if (!currentRecipe) {
      return;
    }

    try {
      await axios.post('/recipes/save', {
        title: currentRecipe.title,
        summary: currentRecipe.summary,
        sourceUrl: currentRecipe.sourceUrl,
        spoonacularId: currentRecipe.id,
        image: currentRecipe.image || '',
        instructions: currentRecipe.instructions,
        ingredients: currentRecipe.ingredients,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const utterance = new SpeechSynthesisUtterance("Recipe saved!");
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      isListeningRef.current = true;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
  };

  const speakCountdown = (num) => {
    const utterance = new SpeechSynthesisUtterance(num.toString());
    utterance.rate = 1.8;
    speechSynthesis.speak(utterance);
  };

  const startTimer = (durationInMinutes) => {
    const durationInSeconds = Math.round(durationInMinutes * 60);

    timeLeftRef.current = durationInSeconds;
    setTimeLeft(durationInSeconds);
    setIsPaused(false);
    isPausedRef.current = false;

    const interval = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 10 && timeLeftRef.current > 0) {
        speakCountdown(timeLeftRef.current);
      }

      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimer(null);

        const utterance = new SpeechSynthesisUtterance("Step complete.");
        utterance.onend = () => {
          nextStep();
        };
        speechSynthesis.speak(utterance);
      }

    }, 1000);

    timerRef.current = interval;
    setTimer(interval);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimer(null);
      setIsPaused(true);
      isPausedRef.current = true;
      const utterance = new SpeechSynthesisUtterance("Timer paused");
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Tried to pause but no timer was running.");
    }
  };

  const resumeTimer = () => {
    if (isPausedRef.current && timeLeftRef.current > 0) {
      setIsPaused(false);
      isPausedRef.current = false;

      const interval = setInterval(() => {
        timeLeftRef.current -= 1;
        setTimeLeft(timeLeftRef.current);

        if (timeLeftRef.current <= 10 && timeLeftRef.current > 0) {
          speakCountdown(timeLeftRef.current);
        }

        if (timeLeftRef.current <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimer(null);
          nextStep();
        }
      }, 1000);

      timerRef.current = interval;
      setTimer(interval);

      const utterance = new SpeechSynthesisUtterance("Timer resumed");
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Tried to resume, but timer is not paused or timeLeft is 0");
    }
  };

  const skipStep = () => {
    const currentRecipe = recipeRef.current;
    const stepIndex = currentStepRef.current;

    if (!currentRecipe || !currentRecipe.instructions) {
      const utterance = new SpeechSynthesisUtterance("Please load a recipe first.");
      speechSynthesis.speak(utterance);
      return;
    }

    if (stepIndex >= currentRecipe.instructions.length - 1) {
      const utterance = new SpeechSynthesisUtterance("You are already at the last step.");
      speechSynthesis.speak(utterance);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimer(null);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep(stepIndex + 1);
  };

  const repeatStep = async () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(null);
    setIsPaused(false);
    isPausedRef.current = false;

    const recipeNow = recipeRef.current;
    const stepIndex = currentStepRef.current;
    const step = recipeNow?.instructions?.[stepIndex];

    if (step) {
      await speakStep(step);
      if (step.time > 0) {
        startTimer(step.time);
      }
    } else {
      console.warn("❌ No step to repeat.");
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const restartRecipe = () => {
    if (timer) clearInterval(timer);
    setTimer(null);
    setCurrentStep(0);
    setTimeLeft(0);
    setIsPaused(false);
    stopSpeaking();
  };

  const speakStep = async (step) => {
    return new Promise((resolve) => {
      const stepIndex = currentStepRef.current + 1;
      const message = `Step ${stepIndex}. ${step.text}`;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onstart = () => setIsSpeaking(true);
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  };

  const nextStep = async (stepIndex = currentStepRef.current) => {
    const steps = recipeRef.current?.instructions || [];

    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      const utterance = new SpeechSynthesisUtterance("Recipe completed! Enjoy your cooking!");
      speechSynthesis.speak(utterance);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      if (timer) clearInterval(timer);
      setTimer(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const askToStartTimer = (duration) => {
      const confirmUtterance = new SpeechSynthesisUtterance("Shall I start the timer?");
      confirmUtterance.onend = () => {
        if (cancelled) return;

        setAwaitingTimerConfirmation(true);
        awaitingTimerConfirmationRef.current = true;

        setTimeout(() => {
          if (awaitingTimerConfirmationRef.current) {
            const fallbackUtter = new SpeechSynthesisUtterance("No response received. Starting timer now.");
            fallbackUtter.onend = () => {
              if (!cancelled) {
                startTimer(duration);
                setAwaitingTimerConfirmation(false);
                awaitingTimerConfirmationRef.current = false;
              }
            };
            speechSynthesis.cancel();
            speechSynthesis.speak(fallbackUtter);
          }
        }, 10000);
      };

      speechSynthesis.cancel();
      speechSynthesis.speak(confirmUtterance);
    };

    const runStep = async () => {
      if (!recipe || !recipe.instructions?.length || cancelled) return;

      const step = recipe.instructions[currentStep];

      if (currentStep === 0 && !ingredientsSpokenRef.current && recipe.ingredients?.length) {
        const ingText = `Here are the ingredients: ${recipe.ingredients.join(', ')}.`;
        const ingUtterance = new SpeechSynthesisUtterance(ingText);

        ingUtterance.onend = async () => {
          if (cancelled) return;

          setIngredientsSpoken(true);
          ingredientsSpokenRef.current = true;

          if (step) {
            await speakStep(step);
            if (step.time > 0) askToStartTimer(step.time);
          }
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(ingUtterance);
        return;
      }

      if (step) {
        await speakStep(step);
        if (step.time > 0) askToStartTimer(step.time);
      }
    };

    runStep();

    return () => {
      cancelled = true;
    };
  }, [currentStep, recipe]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProgressPercentage = () => {
    if (!recipe || !recipe.instructions) return 0;
    return ((currentStep + 1) / recipe.instructions.length) * 100;
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return (
      <div className="p-6">
        <p className="text-red-600">❌ Your browser doesn't support speech recognition.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Kitchen Assistant
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Your voice-controlled cooking companion</p>
        </div>

        {/* Voice Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Control Buttons */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-500" />
                Voice Controls
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isListening
                    ? 'bg-green-500 text-white shadow-lg animate-pulse'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? 'Listening...' : 'Start Listening'}
                </button>

                <button
                  onClick={stopListening}
                  disabled={!isListening}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <MicOff className="w-5 h-5" />
                  Stop
                </button>

                <button
                  onClick={() => setRecipe(sampleRecipe)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <BookOpen className="w-5 h-5" />
                  Load Sample
                </button>
              </div>
            </div>

            {/* Command Info */}
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Voice Commands:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      "Next" or "Skip" - Next step
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      "Repeat" - Repeat current step
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      "Pause" / "Resume" - Timer control
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      "Stop speaking" - Mute voice
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      "Save recipe" - Save current recipe
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Status:</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Last Command:</span>
                      <p className="text-sm font-medium text-gray-800">{lastCommand || 'None'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Listening:</span>
                      <p className="text-sm font-medium text-gray-800">{transcript || 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Section */}
        {recipe ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Recipe Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">{recipe.title}</h2>
                  <p className="text-orange-100 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: recipe.summary }}></p>
                  {recipe.sourceUrl && recipe.sourceUrl !== '#' && (
                    <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-100 hover:text-white mt-3 underline">
                      <BookOpen className="w-4 h-4" />
                      View Full Recipe
                    </a>
                  )}
                </div>
                {recipe.image && (
                  <div className="w-full lg:w-80">
                    <img src={recipe.image} alt={recipe.title}
                      className="w-full h-48 lg:h-56 object-cover rounded-xl shadow-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🧂 Ingredients
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
                        <span className="text-gray-700">{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-gray-800">Cooking Progress</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    Step {currentStep + 1} of {recipe.instructions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Step */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentStep + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">
                    Current Step {isSpeaking && <Volume2 className="inline w-6 h-6 ml-2 text-green-500" />}
                  </h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {recipe.instructions[currentStep]?.text}
                </p>

                {/* Timer Display */}
                {timeLeft > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <span className="text-lg font-semibold text-gray-800">Timer:</span>
                      </div>
                      <span className="text-3xl font-bold text-blue-600 font-mono">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {isPaused && (
                      <div className="flex items-center gap-2 mt-2 text-yellow-600">
                        <Pause className="w-4 h-4" />
                        <span className="text-sm font-medium">Timer Paused</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <SkipBack className="w-5 h-5" />
                  Previous
                </button>

                <button
                  onClick={pauseTimer}
                  disabled={!timer}
                  className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>

                <button
                  onClick={resumeTimer}
                  disabled={!isPaused || timeLeft === 0}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>

                <button
                  onClick={skipStep}
                  disabled={currentStep >= recipe.instructions.length - 1}
                  className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <SkipForward className="w-5 h-5" />
                  Next
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={repeatStep}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Repeat Step
                </button>

                <button
                  onClick={stopSpeaking}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <VolumeX className="w-5 h-5" />
                  Stop Speaking
                </button>

                <button
                  onClick={restartRecipe}
                  className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Recipe
                </button>
              </div>

              {/* All Steps Overview */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📝 Recipe Steps
                </h3>
                <div className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${index === currentStep
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : index < currentStep
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                          }`}>
                          {index < currentStep ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{step.text}</p>
                          {step.time > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{step.time} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <ChefHat className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Cook?</h3>
              <p className="text-lg text-gray-600 mb-6">
                Say "Recipe for [dish name]" or click "Load Sample Recipe" to get started!
              </p>
              <p className="text-sm text-gray-500">
                Make sure voice listening is active to use voice commands.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}