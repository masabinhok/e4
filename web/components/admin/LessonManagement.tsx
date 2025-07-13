import React from "react";
import { Plus, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Opening, OpeningVariation, Status } from "@/types/types";

interface LessonManagementProps {
  openings: Opening[];
  variations: OpeningVariation[];
  toggleStatus: (type: string, id: string) => void;
  handleDelete: (type: string, id: string) => void;
}

const LessonManagement = ({
  openings,
  variations,
  toggleStatus,
  handleDelete,
}: LessonManagementProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-white">Lesson Management</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            Add Lesson
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Openings Table */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 font-semibold text-white">
                  Opening
                </th>
                <th className="text-left p-4 font-semibold text-white">Code</th>
                <th className="text-left p-4 font-semibold text-white">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {openings.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-gray-700">
                  <td className="p-4">
                    <p className="font-medium text-white">{lesson.name}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-white">
                        {lesson.code}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={lesson.status === Status.Accepted}
                      onClick={() => toggleStatus("opening", lesson._id)}
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        lesson.status === Status.Accepted
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      } `}
                    >
                      {lesson.status}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-900 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-400 hover:bg-green-900 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete("opening", lesson._id)}
                        className="p-2 text-red-400 hover:bg-red-900 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variations Table */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 font-semibold text-white">
                  Variations
                </th>
                <th className="text-left p-4 font-semibold text-white">Code</th>
                <th className="text-left p-4 font-semibold text-white">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {variations.map((variation) => (
                <tr key={variation._id} className="hover:bg-gray-700">
                  <td className="p-4">
                    <p className="font-medium text-white">{variation.title}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-white">
                        {variation.code}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={variation.status === Status.Accepted}
                      onClick={() => toggleStatus("variation", variation._id)}
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        variation.status === Status.Accepted
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      } `}
                    >
                      {variation.status}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-900 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-400 hover:bg-green-900 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete("variation", variation._id)}
                        className="p-2 text-red-400 hover:bg-red-900 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LessonManagement;
