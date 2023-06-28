import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

const MAPPING = {
  en: "English",
  he: "Hebrew",
  ru: "Russian",
  de: "German",
  it: "Italian",
  es: "Spanish",
  fr: "French"
};

const REV_MAPPING = Object.fromEntries(Object.entries(MAPPING).map(([key, value]) => [value, key]));

const generate_schedule = (day, language) => {
  return day + "-" + language;
};

const load_schedules = (t, i18n) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const language = MAPPING[i18n.locale] || "English";
  return days.map(day => generate_schedule(day, language));
};

export const Services = () => {
  const { t, i18n } = useTranslation();

  return (
    <Tabs defaultValue="schedule">
      <TabsList>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="sketches">Sketches</TabsTrigger>
      </TabsList>
      <TabsContent value="schedule">{load_schedules(t, i18n)}</TabsContent>
    </Tabs>
    //     <span>%= link_to I18n.t('kabtv.kabtv.questions'), '#', :onclick = 'return kabtv.tabs.select_me(this, "questions")' %</span>
    //     <span>%= link_to I18n.t('kabtv.kabtv.sketches'), '#', :onclick = 'return kabtv.tabs.select_me(this, "sketches")' %</span>
    //   </div>
    //   <div className="content">content</div>
  );
};
