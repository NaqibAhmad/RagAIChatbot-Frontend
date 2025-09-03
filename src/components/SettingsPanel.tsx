import React, { useState } from 'react';
import { Settings, Brain, Search, Thermometer, Save, RotateCcw } from 'lucide-react';
import { ChatSession } from '@/types';
import { OPENAI_MODELS, SEARCH_TYPES, TEMPERATURE_PRESETS, DEFAULT_SETTINGS } from '@/constants';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  session: ChatSession;
  onSettingsUpdate: (settings: Partial<ChatSession['settings']>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ session, onSettingsUpdate }) => {
  const [localSettings, setLocalSettings] = useState(session.settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof ChatSession['settings'], value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      onSettingsUpdate(DEFAULT_SETTINGS);
      setLocalSettings(DEFAULT_SETTINGS);
      setHasChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  const getModelDescription = (modelValue: string) => {
    const model = OPENAI_MODELS.find(m => m.value === modelValue);
    return model?.description || '';
  };

  const getSearchTypeDescription = (searchType: string) => {
    const type = SEARCH_TYPES.find(t => t.value === searchType);
    return type?.description || '';
  };

  const getTemperatureDescription = (temp: number) => {
    const preset = TEMPERATURE_PRESETS.find(p => p.value === temp);
    return preset?.description || '';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">
              Configure your RAG assistant preferences and model settings
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Changes</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2",
                hasChanges
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Model Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Model</h3>
                <p className="text-sm text-gray-500">Choose the OpenAI model for your conversations</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OPENAI_MODELS.map((model) => (
                <div
                  key={model.value}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                    localSettings.model === model.value
                      ? "border-primary-300 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => handleSettingChange('model', model.value)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="model"
                      value={model.value}
                      checked={localSettings.model === model.value}
                      onChange={() => handleSettingChange('model', model.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{model.label}</h4>
                      <p className="text-sm text-gray-500">{model.description}</p>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature Control */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Temperature</h3>
                <p className="text-sm text-gray-500">Control the creativity and randomness of responses</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Temperature Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Current: {localSettings.temperature}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getTemperatureDescription(localSettings.temperature)}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
              
              {/* Temperature Presets */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TEMPERATURE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleSettingChange('temperature', preset.value)}
                      className={cn(
                        "p-3 text-center rounded-lg border transition-colors duration-200",
                        localSettings.temperature === preset.value
                          ? "border-primary-300 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Search Strategy</h3>
                <p className="text-sm text-gray-500">Choose how the system retrieves relevant information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SEARCH_TYPES.map((searchType) => (
                <div
                  key={searchType.value}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                    localSettings.search_type === searchType.value
                      ? "border-primary-300 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => handleSettingChange('search_type', searchType.value)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="search_type"
                      value={searchType.value}
                      checked={localSettings.search_type === searchType.value}
                      onChange={() => handleSettingChange('search_type', searchType.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{searchType.label}</h4>
                      <p className="text-sm text-gray-500">{searchType.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Model</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {OPENAI_MODELS.find(m => m.value === localSettings.model)?.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getModelDescription(localSettings.model)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Temperature</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {localSettings.temperature}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getTemperatureDescription(localSettings.temperature)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Type</h4>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {localSettings.search_type}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getSearchTypeDescription(localSettings.search_type)}
                </p>
              </div>
            </div>
          </div>

          {/* Save Changes Notice */}
          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Settings className="w-3 h-3 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Unsaved Changes</h4>
                  <p className="text-sm text-yellow-700">
                    You have unsaved changes. Click "Save Changes" to apply them to your session.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
